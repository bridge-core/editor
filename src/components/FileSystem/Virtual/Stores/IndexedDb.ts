import { IDBWrapper } from '../IDB'
import {
	BaseStore,
	FsKindEnum,
	IDirectoryData,
	IDirEntry,
	IFileData,
	TFsKind,
	TStoreType,
} from './BaseStore'
import { GlobalMutex } from '/@/components/Common/GlobalMutex'
import { basename, dirname } from '/@/libs/path'

export interface IIndexedDbSerializedData {
	storeName?: string
	mapData?: [string, any][]
}

export class IndexedDbStore extends BaseStore<IIndexedDbSerializedData> {
	public readonly type = 'idbStore'
	protected idb: IDBWrapper
	protected globalMutex = new GlobalMutex()

	constructor(storeName?: string, isReadOnly = false) {
		super(isReadOnly)
		this.idb = new IDBWrapper(storeName)
	}

	serialize() {
		return <const>{
			type: this.type,
			storeName: this.idb.storeName,
		}
	}
	static deserialize(data: IIndexedDbSerializedData & { type: TStoreType }) {
		return new IndexedDbStore(data.storeName)
	}

	lockAccess(path: string) {
		return this.globalMutex.lock(path)
	}
	unlockAccess(path: string) {
		return this.globalMutex.unlock(path)
	}

	clear() {
		if (this.isReadOnly) return

		return this.idb.clear()
	}

	protected async addChild(
		parentDir: string,
		childName: string,
		childKind: TFsKind
	) {
		// If parent directory is root directory, we don't need to manually add a child entry
		if (parentDir === '' || parentDir === '.') return

		await this.lockAccess(parentDir)

		let parentChilds = await this.idb.get<IDirectoryData | string[]>(
			parentDir
		)

		if (parentChilds === undefined) {
			await this.createDirectory(parentDir)
			parentChilds = []
		}

		if (Array.isArray(parentChilds)) {
			// Old format where we stored dir entries as strings

			// Filter out childName from parentChilds
			parentChilds = parentChilds
				.filter((child) => typeof child === 'string') // This filter call is only there to fix already duplicated entries in the database. Can be removed in a future update
				.filter((child) => child !== childName)

			// Push new child entry
			parentChilds.push(childName)
		} else {
			// New format where we store dir entries as objects

			// Filter out childName from parentChilds
			parentChilds = {
				kind: FsKindEnum.Directory,
				data: parentChilds.data.filter((child) =>
					typeof child === 'string'
						? child !== childName
						: child.name !== childName
				),
			}

			// Push new child entry
			parentChilds.data.push({
				kind: childKind,
				name: childName,
			})
		}

		await this.idb.set(parentDir, parentChilds)

		this.unlockAccess(parentDir)
	}

	async createDirectory(path: string) {
		if (this.isReadOnly) return
		if (path === '' || path === '.') return

		const dirExists = await this.idb.has(path)
		if (dirExists) return // No work to do, directory already exists

		const parentDir = dirname(path)
		const dirName = basename(path)

		await this.addChild(parentDir, dirName, FsKindEnum.Directory)
		await this.idb.set(path, { kind: FsKindEnum.Directory, data: [] })
	}

	async getDirectoryEntries(path: string) {
		const entries = await this.idb.get<IDirectoryData | string[]>(path)
		if (entries === undefined) {
			throw new Error(
				`Trying to get directory entries for ${path} but it does not exist`
			)
		}

		return Array.isArray(entries) ? entries : entries.data
	}

	async writeFile(path: string, data: Uint8Array) {
		if (this.isReadOnly) return

		const parentDir = dirname(path)
		const fileName = basename(path)

		await this.addChild(parentDir, fileName, FsKindEnum.File)

		await this.idb.set(path, {
			kind: FsKindEnum.File,
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
		let lastModified = Date.now()
		// Old format where we stored Uint8Array directly
		if (rawData instanceof Uint8Array) {
			data = rawData
		} else {
			lastModified = rawData.lastModified ?? Date.now()
			data = rawData.data ?? new Uint8Array()
		}

		return new File([data], basename(path), { lastModified })
	}

	async unlink(path: string) {
		if (this.isReadOnly) return

		const parentDir = dirname(path)
		const fileName = basename(path)

		await this.lockAccess(parentDir)

		const parentChilds = await this.idb.get<IDirectoryData | string[]>(
			parentDir
		)
		if (parentChilds !== undefined) {
			if (Array.isArray(parentChilds)) {
				await this.idb.set(
					parentDir,
					parentChilds.filter((child) => child !== fileName)
				)
			} else {
				await this.idb.set(parentDir, {
					kind: FsKindEnum.Directory,
					data: parentChilds.data.filter(
						(child) => child.name !== fileName
					),
				})
			}
		}
		// TODO: Fix directory unlinking

		await this.idb.del(path)

		this.unlockAccess(parentDir)
	}

	async typeOf(path: string) {
		const data = await this.idb.get(path)
		if (data === undefined) return null

		if (data instanceof Uint8Array) return 'file'
		else if (Array.isArray(data)) return 'directory'
		else return data.kind === FsKindEnum.Directory ? 'directory' : 'file' // New object based file format
	}
}
