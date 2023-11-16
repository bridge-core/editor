import { basename, dirname } from '/@/libs/path'
import { zipSize } from '/@/libs/app/dataPackage'
import { baseUrl } from '/@/libs/baseUrl'
import { unzip, Unzipped } from 'fflate'
import { LocalFileSystem } from '/@/libs/fileSystem/LocalFileSystem'

export class Data {
	private fileSystem = new LocalFileSystem()

	constructor() {
		this.fileSystem.setRootName('data')
	}

	public async load() {
		console.time('[App] Data')

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

		console.timeEnd('[App] Data')
	}

	public async get(path: string) {
		return await this.fileSystem.readFileJSON(path)
	}
}
