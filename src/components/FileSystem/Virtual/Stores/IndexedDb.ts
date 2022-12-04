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
import { basename, dirname } from '/@/utils/path'

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

		// Old format where we stored dir entries as strings
		if (Array.isArray(parentChilds)) {
			await this.idb.set(parentDir, [
				...new Set([
					...parentChilds,
					{
						name: childName,
						kind: childKind,
					},
				]),
			])
		} else {
			// New format where we store dir entries as objects
			await this.idb.set(parentDir, {
				kind: FsKindEnum.Directory,
				data: [
					...new Set([
						...parentChilds.data,
						{
							name: childName,
							kind: childKind,
						},
					]),
				],
			})
		}

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
		if (Array.isArray(rawData)) {
			data = <Uint8Array>rawData
		} else {
			data = (<IFileData>rawData).data ?? new Uint8Array()
			lastModified = (<IFileData>rawData).lastModified ?? Date.now()
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
