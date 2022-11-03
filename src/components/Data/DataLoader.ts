import { baseUrl } from '/@/utils/baseUrl'
import { unzip, Unzipped } from 'fflate'
import { VirtualDirectoryHandle } from '../FileSystem/Virtual/DirectoryHandle'
import { basename, dirname } from '/@/utils/path'
import { FileSystem } from '../FileSystem/FileSystem'
import { zipSize } from '/@/utils/app/dataPackage'
import { whenIdle } from '/@/utils/whenIdle'
import { get, set } from 'idb-keyval'
import { IDBWrapper } from '/@/components/FileSystem/Virtual/IDB'
import { compareVersions } from 'bridge-common-utils'
import { version as appVersion } from '/@/utils/app/version'

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

	async loadData(forceDataDownload = false) {
		if (this.hasFired) {
			console.warn(
				`This dataLoader instance already loaded data. You called loadData() twice.`
			)
			return
		}

		let savedDataForVersion = await get<string | undefined>(
			'savedDataForVersion'
		)
		if (forceDataDownload) {
			savedDataForVersion = undefined
			await set('savedDataForVersion', undefined)
		}
		const savedAllDataInIdb = savedDataForVersion
			? compareVersions(appVersion, savedDataForVersion, '=')
			: false

		if (this.isMainLoader)
			console.log(
				savedAllDataInIdb
					? '[APP] Data saved; restoring from cache...'
					: `[APP] Latest data not saved; fetching now...`
			)

		console.time('[App] Data')
		const mayClearDb = this.isMainLoader && !savedAllDataInIdb

		// Create virtual filesystem
		this._virtualFileSystem = new VirtualDirectoryHandle(
			new IDBWrapper('data-fs'),
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
		console.timeEnd('[App] Data')

		if (this.isMainLoader && !forceDataDownload) {
			whenIdle(async () => {
				await this._virtualFileSystem!.moveToIdb()
				await set('savedDataForVersion', appVersion)
			})
		}
	}
}
