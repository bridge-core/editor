import { IDBWrapper } from '../IDB'
import { TStoreType } from './BaseStore'
import { IIndexedDbSerializedData, IndexedDbStore } from './IndexedDb'

export class MemoryDb extends IDBWrapper {
	public readonly type = 'memoryStore'
	protected _store: Map<IDBValidKey, any>

	constructor(
		public readonly storeName: string = 'virtual-fs',
		mapData?: [IDBValidKey, any][]
	) {
		super(storeName)

		this._store = new Map(mapData)
	}

	async set(key: IDBValidKey, value: any) {
		this._store.set(key, value)
	}
	get<T = any>(key: IDBValidKey) {
		return <T>this._store.get(key)
	}
	async del(key: IDBValidKey) {
		this._store.delete(key)
	}
	async setMany(arr: [IDBValidKey, any][]) {
		for (const [key, value] of arr) {
			await this.set(key, value)
		}
	}
	async getMany<T>(arr: IDBValidKey[]) {
		const res: T[] = []
		for (const key of arr) {
			res.push(await this.get(key))
		}
		return res
	}
	async clear() {
		return this._store.clear()
	}
	async has(key: IDBValidKey) {
		return (await this.get(key)) !== undefined
	}
	async keys() {
		return [...this._store.keys()]
	}
	entries() {
		return this._store.entries()
	}

	async toIdb() {
		await super.setMany([...this._store.entries()])
		return new IndexedDbStore(this.storeName)
	}
}

export class MemoryStore extends IndexedDbStore {
	protected idb: MemoryDb

	constructor(storeName?: string, mapData?: [IDBValidKey, any][]) {
		super(storeName)
		this.idb = new MemoryDb(storeName, mapData)
	}

	serialize() {
		return <const>{
			type: this.type,
			storeName: this.idb.storeName,
			mapData: [...this.idb.entries()],
		}
	}
	static deserialize(data: IIndexedDbSerializedData & { type: TStoreType }) {
		return new MemoryStore(data.storeName, data.mapData)
	}

	toIdb() {
		return this.idb.toIdb()
	}
}