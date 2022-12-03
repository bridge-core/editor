import { AnyHandle } from '../Types'
import { BaseVirtualHandle } from './Handle'
import { TauriFsStore } from './Stores/TauriFs'

export async function pathFromHandle(handle: AnyHandle) {
	if (!import.meta.env.VITE_IS_TAURI_APP)
		throw new Error('Can only get path from handle in Tauri builds')
	if (!(handle instanceof BaseVirtualHandle))
		throw new Error(`Expected a virtual handle`)

	const baseStore = handle.getBaseStore()
	if (!(baseStore instanceof TauriFsStore))
		throw new Error(
			`Expected a TauriFsStore instance to back VirtualHandle`
		)

	return await baseStore.resolvePath(handle.idbKey)
}
