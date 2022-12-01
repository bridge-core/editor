import { appLocalDataDir } from '@tauri-apps/api/path'
import { VirtualDirectoryHandle } from '../components/FileSystem/Virtual/DirectoryHandle'
import { IndexedDbStore } from '../components/FileSystem/Virtual/Stores/IndexedDb'
import { join } from './path'

async function doesSupportWritable() {
	const dirHandle = await navigator.storage.getDirectory()
	const fileHandle = await dirHandle.getFileHandle(
		'bridge-supports-writable-test',
		{ create: true }
	)

	const supportsWritable = typeof fileHandle.createWritable === 'function'

	// Safari throws error if we try to remove the file again -\_(-_-)_/-
	// if (typeof dirHandle.removeEntry === 'function')
	// await dirHandle.removeEntry('bridge-supports-writable-test')

	return supportsWritable
}

export async function getStorageDirectory() {
	if (import.meta.env.VITE_IS_TAURI_APP) {
		const { TauriFsStore } = await import(
			'/@/components/FileSystem/Virtual/Stores/TauriFs'
		)

		return new VirtualDirectoryHandle(
			new TauriFsStore(join(await appLocalDataDir(), 'bridge')),
			'bridge'
		)
	}

	if (
		typeof navigator.storage?.getDirectory !== 'function' ||
		!(await doesSupportWritable())
	) {
		return new VirtualDirectoryHandle(new IndexedDbStore(), 'bridgeFolder')
	}

	return await navigator.storage.getDirectory()
}
