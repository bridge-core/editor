import { zipSize } from '@/libs/app/DataPackage'
import { baseUrl } from '@/libs/app/AppEnv'
import { unzip, Unzipped } from 'fflate'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'
import { EventSystem } from '@/libs/event/EventSystem'
import { onMounted, onUnmounted, ref, Ref } from 'vue'
import { data } from '@/App'

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
	public eventSystem = new EventSystem(['loaded'])

	private fileSystem = new LocalFileSystem()

	constructor() {
		this.fileSystem.setRootName('data')
	}

	public async load() {
		if (await this.fileSystem.exists('loaded')) {
			this.eventSystem.dispatch('loaded', null)

			return
		}

		const rawData = await fetch(baseUrl + 'packages.zip').then((response) =>
			response.arrayBuffer()
		)

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
				this.fileSystem.makeDirectory(path)
			} else {
				this.fileSystem.writeFile(path, unzipped[path])
			}
		}

		await this.fileSystem.writeFile('loaded', '')

		this.eventSystem.dispatch('loaded', null)
	}

	public async get(path: string): Promise<any> {
		return await this.fileSystem.readFileJson(path)
	}

	public async getText(path: string): Promise<string> {
		return await this.fileSystem.readFileText(path)
	}

	public async getRaw(path: string): Promise<ArrayBuffer> {
		return await this.fileSystem.readFile(path)
	}
}

export function useGetData(): Ref<(path: string) => undefined | any> {
	const get = ref((path: string) => Promise.resolve(undefined))

	function updateGet() {
		get.value = (path: string) => data.get(path)
	}

	onMounted(() => {
		data.eventSystem.on('loaded', updateGet)
	})

	onUnmounted(() => {
		data.eventSystem.off('loaded', updateGet)
	})

	return get
}
