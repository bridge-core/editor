import { IDBWrapper } from '../IDB'
import { BaseStore, IFileData } from './BaseStore'
import { GlobalMutex } from '/@/components/Common/GlobalMutex'

export class IndexedDbStore extends BaseStore {
	protected idb: IDBWrapper
	protected globalMutex = new GlobalMutex()

	constructor(storeName?: string) {
		super()
		this.idb = new IDBWrapper(storeName)
	}

	lockAccess(path: string) {
		return this.globalMutex.lock(path)
	}
	unlockAccess(path: string) {
		return this.globalMutex.unlock(path)
	}

	clear() {
		return this.idb.clear()
	}

	async addChild(parentDir: string, childName: string) {
		// If parent directory is root directory, we don't need to manually add a child entry
		if (parentDir === '') return

		await this.lockAccess(parentDir)

		let parentChilds = await this.idb.get<string[]>(parentDir)

		if (parentChilds === undefined) {
			await this.createDirectory(parentDir)
			parentChilds = []
		}

		await this.idb.set(parentDir, [...parentChilds, childName])

		this.unlockAccess(parentDir)
	}

	async createDirectory(path: string) {
		const dirExists = await this.idb.has(path)
		if (dirExists) return // No work to do, directory already exists

		const splitPath = path.split('/')
		const parentDir = splitPath.slice(0, -1).join('/')
		const dirName = splitPath[splitPath.length - 1]

		await this.addChild(parentDir, dirName)
		await this.idb.set(path, [])
	}

	async getDirectoryEntries(path: string) {
		const entries = await this.idb.get(path)
		if (entries === undefined) {
			throw new Error(
				`Trying to get directory entries for ${path} but it does not exist`
			)
		}

		return entries
	}

	async writeFile(path: string, data: Uint8Array) {
		const splitPath = path.split('/')
		const parentDir = splitPath.slice(0, -1).join('/')
		const fileName = splitPath[splitPath.length - 1]

		await this.addChild(parentDir, fileName)

		await this.idb.set(path, {
			lastModified: Date.now(),
			data,
		})
	}

	async readFile(path: string) {
		const rawData = await this.idb.get<Uint8Array | IFileData>(path)

		if (rawData === undefined) {
			throw new Error(`Trying to read file ${path} that does not exist`)
		}

		let data: Uint8Array
		// Old format where we stored Uint8Array directly
		if (Array.isArray(rawData)) {
			data = <Uint8Array>rawData
		} else {
			data = (<IFileData>rawData).data ?? new Uint8Array()
		}

		return data
	}

	async unlink(path: string) {
		const splitPath = path.split('/')
		const parentDir = splitPath.slice(0, -1).join('/')
		const fileName = splitPath[splitPath.length - 1]

		await this.lockAccess(parentDir)

		const parentChilds = await this.idb.get<string[]>(parentDir)
		if (parentChilds !== undefined) {
			await this.idb.set(
				parentDir,
				parentChilds.filter((child) => child !== fileName)
			)
		}

		await this.idb.del(path)

		this.unlockAccess(parentDir)
	}

	async typeOf(path: string) {
		const data = await this.idb.get(path)
		if (data === undefined) return null

		if (data instanceof Uint8Array) return 'file'
		else if (!Array.isArray(data))
			return 'file' // New object based file format
		else return 'directory'
	}
}
