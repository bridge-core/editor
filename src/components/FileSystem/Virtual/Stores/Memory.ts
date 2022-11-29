import { IDBWrapper } from '../IDB'
import { IndexedDbStore } from './IndexedDb'

export class MemoryDb extends IDBWrapper {
	protected _store = new Map<IDBValidKey, any>()

	constructor(public readonly storeName: string = 'virtual-fs') {
		super(storeName)
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

	async toIdb() {
		await super.setMany([...this._store.entries()])
		return new IndexedDbStore(this.storeName)
	}
}

export class MemoryStore extends IndexedDbStore {
	protected idb: MemoryDb

	constructor(storeName?: string) {
		super(storeName)
		this.idb = new MemoryDb(storeName)
	}

	toIdb() {
		return this.idb.toIdb()
	}
}
