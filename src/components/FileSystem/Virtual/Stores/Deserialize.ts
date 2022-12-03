import type { BaseStore, TStoreType } from './BaseStore'
import { IndexedDbStore } from './IndexedDb'
import { MemoryStore } from './Memory'
import { TauriFsStore } from './TauriFs'

export function deserializeStore(data: any & { type: TStoreType }): BaseStore {
	if (typeof data !== 'object' || data === null)
		throw new Error('BaseStore deserialization data must be an object')
	if (!('type' in data))
		throw new Error(
			'BaseStore deserialization data must have a type property'
		)

	switch (data.type) {
		case 'idbStore':
			return IndexedDbStore.deserialize(data)
		case 'memoryStore':
			return MemoryStore.deserialize(data)
		case 'tauriFsStore':
			return TauriFsStore.deserialize(data)
		default:
			throw new Error(`Unknown base store type: ${data.type}`)
	}
}
