import { zipSize } from '@/libs/app/DataPackage'
import { baseUrl } from '@/libs/app/AppEnv'
import { unzip, Unzipped } from 'fflate'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'

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
	private fileSystem = new LocalFileSystem()

	constructor() {
		this.fileSystem.setRootName('data')
	}

	public async load() {
		if (await this.fileSystem.exists('loaded')) return

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
	}

	public async get(path: string): Promise<any> {
		return await this.fileSystem.readFileJson(path)
	}

	public async getRaw(path: string): Promise<ArrayBuffer> {
		return await this.fileSystem.readFile(path)
	}
}
