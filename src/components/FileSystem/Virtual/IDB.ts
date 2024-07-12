import {
	createStore,
	set as rawSet,
	get as rawGet,
	del as rawDel,
	setMany as rawSetMany,
	getMany as rawGetMany,
	clear as clearRaw,
	keys as rawKeys,
	UseStore,
} from 'idb-keyval'

const virtualFs = createStore('virtual-fs', 'virtual-fs-store')

export const set = (key: IDBValidKey, value: any) =>
	rawSet(key, value, virtualFs)
export const get = <T = any>(key: IDBValidKey) => rawGet<T>(key, virtualFs)
export const del = (key: IDBValidKey) => rawDel(key, virtualFs)
export const setMany = (arr: [IDBValidKey, any][]) => rawSetMany(arr, virtualFs)
export const getMany = <T>(arr: IDBValidKey[]) => rawGetMany<T>(arr, virtualFs)
export const clear = () => clearRaw(virtualFs)
export const has = async (key: IDBValidKey) => (await get(key)) !== undefined
export const keys = () => rawKeys(virtualFs)

export class IDBWrapper {
	protected store: UseStore

	constructor(public readonly storeName: string = 'virtual-fs') {
		this.store = createStore(storeName, `${storeName}-store`)
	}

	set(key: IDBValidKey, value: any) {
		return rawSet(key, value, this.store)
	}
	get<T = any>(key: IDBValidKey) {
		return rawGet<T>(key, this.store)
	}
	del(key: IDBValidKey) {
		return rawDel(key, this.store)
	}
	setMany(arr: [IDBValidKey, any][]) {
		return rawSetMany(arr, this.store)
	}
	getMany<T>(arr: IDBValidKey[]) {
		return rawGetMany<T>(arr, this.store)
	}
	clear() {
		return clearRaw(this.store)
	}
	async has(key: IDBValidKey) {
		return (await rawGet(key, this.store)) !== undefined
	}
	keys() {
		return rawKeys(this.store)
	}
}
