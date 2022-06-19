import { baseUrl } from '/@/utils/baseUrl'
import { unzip, Unzipped } from 'fflate'
import { VirtualDirectoryHandle } from '../FileSystem/Virtual/DirectoryHandle'
import { basename, dirname } from '/@/utils/path'
import { FileSystem } from '../FileSystem/FileSystem'
import { zipSize } from '/@/utils/app/dataPackage'
import { supportsIdleCallback, whenIdle } from '/@/utils/whenIdle'
import { get, set } from 'idb-keyval'
import { BaseVirtualHandle } from '../FileSystem/Virtual/Handle'

export class DataLoader extends FileSystem {
	_virtualFileSystem?: VirtualDirectoryHandle

	get virtualFileSystem() {
		if (!this._virtualFileSystem) {
			throw new Error('DataLoader: virtualFileSystem is not initialized')
		}
		return this._virtualFileSystem
	}
	constructor(protected isMainLoader = false) {
		super()
	}

	async loadData() {
		if (this.hasFired) {
			console.warn(
				`This dataLoader instance already loaded data. You called loadData() twice.`
			)
			return
		}

		const savedAllDataInIdb = await get<boolean | undefined>(
			'savedAllDataInIdb'
		)
		if (this.isMainLoader)
			console.log(
				savedAllDataInIdb
					? '[APP] Data saved; restoring from cache...'
					: '[APP] Data not saved; fetching now...'
			)

		console.time('[App] Data')
		const mayClearDb = this.isMainLoader && !savedAllDataInIdb

		// Create virtual filesystem
		this._virtualFileSystem = new VirtualDirectoryHandle(
			null,
			'bridgeFolder',
			savedAllDataInIdb ? undefined : new Map(),
			mayClearDb
		)
		await this._virtualFileSystem.setupDone.fired

		// All current data is already downloaded & saved in IDB, no need to do it again
		if (savedAllDataInIdb) {
			this.setup(this._virtualFileSystem)
			console.timeEnd('[App] Data')
			return
		}

		// Read packages.zip file
		const rawData = await fetch(baseUrl + 'packages.zip').then((response) =>
			response.arrayBuffer()
		)
		if (rawData.byteLength !== zipSize) {
			throw new Error(
				`Error: Data package was larger than the expected size of ${zipSize} bytes; got ${rawData.byteLength} bytes`
			)
		}

		// Unzip data
		const unzipped = await new Promise<Unzipped>((resolve, reject) =>
			unzip(new Uint8Array(rawData), async (error, zip) => {
				if (error) return reject(error)
				resolve(zip)
			})
		)

		const defaultHandle = await this._virtualFileSystem.getDirectoryHandle(
			'data',
			{ create: true }
		)
		const folders: Record<string, VirtualDirectoryHandle> = {
			'.': defaultHandle,
		}

		const inMemoryFiles = []

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
				const fileHandle = await folders[parentDir].getFileHandle(
					name,
					{
						create: true,
						initialData: unzipped[path],
					}
				)

				if (fileHandle.isFileStoredInMemory)
					inMemoryFiles.push(fileHandle)
			}
		}

		this.setup(this._virtualFileSystem)
		console.timeEnd('[App] Data')

		if (this.isMainLoader && supportsIdleCallback) {
			const allMemoryHandles: BaseVirtualHandle[] = [
				...inMemoryFiles,
				...Object.values(folders),
			]
			setTimeout(() => {
				Promise.all(
					allMemoryHandles.map((fileHandle) =>
						whenIdle(() => fileHandle.moveToIdb())
					)
				).then(async () => {
					console.log('ALL DATA SAVED')
					await set('savedAllDataInIdb', true)
				})
			}, 100000)
		}
	}
}
