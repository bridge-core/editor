import { zipSize } from '@/libs/app/DataPackage'
import { baseUrl } from '@/libs/app/AppEnv'
import { unzip, Unzipped } from 'fflate'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'
import { onMounted, onUnmounted, ref, Ref } from 'vue'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'

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
		Data.fileSystem.setRootName('data')

		if (await Data.fileSystem.exists('loaded')) {
			Data.loaded.dispatch(undefined)

			return
		}

		const rawData = await fetch(baseUrl + 'packages.zip').then((response) => response.arrayBuffer())

		if (rawData.byteLength !== zipSize) {
			throw new Error(
				`Error: Data package was larger than the expected size of ${zipSize} bytes; got ${rawData.byteLength} bytes`
			)
		}

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

		await Data.fileSystem.writeFile('loaded', '')

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
	const get = ref((path: string) => Promise.resolve(undefined))

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
