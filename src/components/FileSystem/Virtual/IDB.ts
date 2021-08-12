import {
	createStore,
	set as rawSet,
	get as rawGet,
	del as rawDel,
	setMany as rawSetMany,
	getMany as rawGetMany,
	clear as clearRaw,
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
