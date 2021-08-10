import { baseUrl } from '/@/utils/baseUrl'
import { unzip, Unzipped } from 'fflate'
import { VirtualDirectoryHandle } from '../FileSystem/Virtual/DirectoryHandle'
import { basename, dirname } from '/@/utils/path'
import { FileSystem } from '../FileSystem/FileSystem'

export class DataLoader extends FileSystem {
	_virtualFileSystem?: VirtualDirectoryHandle

	get virtualFileSystem() {
		if (!this._virtualFileSystem) {
			throw new Error('DataLoader: virtualFileSystem is not initialized')
		}
		return this._virtualFileSystem
	}

	constructor(clearDB = false) {
		super()
		this.loadData(clearDB)
	}

	async loadData(clearDB = false) {
		// Read packages.zip file
		const rawData = await fetch(baseUrl + 'packages.zip').then((response) =>
			response.arrayBuffer()
		)

		// Unzip data
		const unzipped = await new Promise<Unzipped>((resolve, reject) =>
			unzip(new Uint8Array(rawData), async (error, zip) => {
				if (error) return reject(error)
				resolve(zip)
			})
		)

		// Create virtual filesystem
		this._virtualFileSystem = new VirtualDirectoryHandle(
			null,
			'dataFolder',
			clearDB
		)
		const defaultHandle = await this._virtualFileSystem.getDirectoryHandle(
			'data',
			{ create: true }
		)
		const folders: Record<string, VirtualDirectoryHandle> = {
			'.': defaultHandle,
		}

		for (const path in unzipped) {
			const name = basename(path)
			const parentDir = dirname(path)

			if (path.endsWith('/')) {
				// Current entry is a folder
				const handle = await folders[parentDir].getDirectoryHandle(
					name,
					{ create: true }
				)
				folders[path.slice(0, -1)] = handle
			} else {
				// Current entry is a file
				await folders[parentDir].getFileHandle(name, {
					create: true,
					initialData: unzipped[path],
				})
			}
		}

		this.setup(this._virtualFileSystem)
	}
}
