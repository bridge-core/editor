import { baseUrl } from '@/libs/app/AppEnv'
import { unzip, Unzipped } from 'fflate'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'
import { onMounted, onUnmounted, ref, Ref } from 'vue'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { Windows } from '@/components/Windows/Windows'
import { AlertWindow } from '@/components/Windows/Alert/AlertWindow'
import { Settings } from '@/libs/settings/Settings'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'

export interface FormatVersionDefinitions {
	currentStable: string
	formatVersions: string[]
}

export interface ExperimentalToggle {
	name: string
	id: string
	description: string
	icon: string
}

export class Data {
	public static loaded: Event<undefined> = new Event()

	private static fileSystem = new LocalFileSystem()

	public static async load() {
		await Settings.addSetting('dataDeveloperMode', {
			default: false,
		})

		Data.fileSystem.setRootName('data')

		let hash: string | undefined = undefined

		try {
			hash = await fetch('https://raw.githubusercontent.com/bridge-core/editor-packages/release/hash', {
				cache: 'no-cache',
			}).then((response) => response.text())
		} catch {}

		let packagesUrl = 'https://raw.githubusercontent.com/bridge-core/editor-packages/release/packages.zip'

		if (Settings.get('dataDeveloperMode')) {
			if (await Data.fileSystem.exists('hash')) await Data.fileSystem.removeFile('hash')

			hash = undefined
		}

		if (hash === undefined) {
			if (await Data.fileSystem.exists('hash')) {
				console.log('[Data] Failed to fetch hash but cache exists')

				Data.loaded.dispatch(undefined)

				return
			} else {
				console.log('[Data] Failed to fetch hash, falling back to built in data')

				packagesUrl = baseUrl + 'packages.zip'

				try {
					hash = await fetch(baseUrl + 'hash', {
						cache: 'no-cache',
					}).then((response) => response.text())
				} catch {}

				if (hash === undefined) throw new Error('Failed to load fallback data!')
			}
		}

		if ((await Data.fileSystem.exists('hash')) && (await Data.fileSystem.readFileText('hash')) === hash) {
			console.log('[Data] Skipped fetching data because hash matches')

			Data.loaded.dispatch(undefined)

			return
		}

		console.log('[Data] Fetching data')

		NotificationSystem.addNotification(
			'package_2',
			() => {
				Windows.open(new AlertWindow('A new data update has been installed.'))
			},
			'primary'
		)

		const rawData = await fetch(packagesUrl, {
			cache: 'no-cache',
		}).then((response) => response.arrayBuffer())

		const unzipped = await new Promise<Unzipped>((resolve, reject) =>
			unzip(new Uint8Array(rawData), async (error, zip) => {
				if (error) return reject(error)

				resolve(zip)
			})
		)

		for (const path in unzipped) {
			if (path.endsWith('/')) {
				Data.fileSystem.makeDirectory(path)
			} else {
				Data.fileSystem.writeFile(path, unzipped[path])
			}
		}

		await Data.fileSystem.writeFile('hash', hash)

		Data.loaded.dispatch(undefined)
	}

	public static async get(path: string): Promise<any> {
		return await Data.fileSystem.readFileJson(path)
	}

	public static async getText(path: string): Promise<string> {
		return await Data.fileSystem.readFileText(path)
	}

	public static async getRaw(path: string): Promise<ArrayBuffer> {
		return await Data.fileSystem.readFile(path)
	}
}

export function useGetData(): Ref<(path: string) => undefined | any> {
	const get = ref((path: string) => Data.get(path))

	function updateGet() {
		get.value = (path: string) => Data.get(path)
	}

	let disposable: Disposable

	onMounted(() => {
		disposable = Data.loaded.on(updateGet)
	})

	onUnmounted(() => {
		disposable.dispose()
	})

	return get
}
