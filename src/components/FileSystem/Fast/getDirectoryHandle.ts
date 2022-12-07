import { IGetHandleConfig } from '../Common'
import { VirtualDirectoryHandle } from '../Virtual/DirectoryHandle'
import { pathFromHandle } from '../Virtual/pathFromHandle'
import { IndexedDbStore } from '../Virtual/Stores/IndexedDb'
import { join } from '/@/utils/path'

export async function getDirectoryHandleTauri(
	baseDirectory: VirtualDirectoryHandle,
	pathArr: string[],
	{ create, createOnce }: Partial<IGetHandleConfig>
) {
	// Cannot apply fast path if baseDirectory is not a virtual directory
	const baseStore = baseDirectory.getBaseStore()

	// Cannot apply fast path if baseStore is not a TauriFsStore
	const { TauriFsStore } = await import('../Virtual/Stores/TauriFs')
	if (!(baseStore instanceof TauriFsStore)) return false

	const { createDir, exists } = await import('@tauri-apps/api/fs')
	const { join, basename, sep } = await import('@tauri-apps/api/path')
	const fullPath = await join(await pathFromHandle(baseDirectory), ...pathArr)

	if (create) {
		await createDir(fullPath, { recursive: !createOnce }).catch((err) => {
			throw new Error(
				`Failed to access "${fullPath}": Directory does not exist: ${err}`
			)
		})
	} else if (!(await exists(fullPath))) {
		throw new Error(
			`Failed to access "${fullPath}": Directory does not exist`
		)
	}

	const basePath = baseStore.getBaseDirectory()

	return new VirtualDirectoryHandle(
		baseStore,
		await basename(fullPath),
		basePath
			? // pathArr may not contain full path starting from basePath if baseDirectory is not the root directory
			  fullPath.replace(`${basePath}${sep}`, '').split(sep)
			: pathArr
	)
}

export async function getDirectoryHandleIndexedDb(
	baseDirectory: VirtualDirectoryHandle,
	pathArr: string[],
	{ create, createOnce }: Partial<IGetHandleConfig>
) {
	// Cannot use fast path if createOnce is true
	if (createOnce) return false

	const baseStore = baseDirectory.getBaseStore()

	// Cannot apply fast path if baseStore is not a IndexedDbStore
	if (!(baseStore instanceof IndexedDbStore)) return false

	const fullPath = join(baseDirectory.idbKey, ...pathArr)
	let directoryData = await baseStore
		.getDirectoryEntries(fullPath)
		.catch(() => null)

	if (create) {
		await baseStore.createDirectory(fullPath)
		directoryData = []
	}

	if (!directoryData)
		throw new Error(
			`Failed to access "${fullPath}": Directory does not exist`
		)

	return new VirtualDirectoryHandle(
		baseStore,
		pathArr[pathArr.length - 1],
		fullPath.split(/\\|\//g)
	)
}
