import { tauriBuild } from '@/libs/tauri/Tauri'
import { BaseFileSystem } from './BaseFileSystem'
import { PWAFileSystem } from './PWAFileSystem'
import { TauriFileSystem } from './TauriFileSystem'
import { get, set } from 'idb-keyval'

export function getFileSystem(): BaseFileSystem {
	if (tauriBuild) return new TauriFileSystem()

	return new PWAFileSystem()
}

export const fileSystem = getFileSystem()

export async function selectOrLoadBridgeFolder() {
	if (!(fileSystem instanceof PWAFileSystem)) return

	const savedHandle: undefined | FileSystemDirectoryHandle = await get('bridgeFolderHandle')

	if (!fileSystem.baseHandle && savedHandle && (await fileSystem.ensurePermissions(savedHandle))) {
		fileSystem.setBaseHandle(savedHandle)

		return
	}

	try {
		fileSystem.setBaseHandle(
			(await window.showDirectoryPicker({
				mode: 'readwrite',
			})) ?? null
		)

		await set('bridgeFolderHandle', fileSystem.baseHandle)
	} catch {}
}
