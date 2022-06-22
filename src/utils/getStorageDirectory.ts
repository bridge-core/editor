import { VirtualDirectoryHandle } from '../components/FileSystem/Virtual/DirectoryHandle'

export async function getStorageDirectory() {
	if (
		typeof navigator.storage?.getDirectory !== 'function' ||
		navigator.vendor.includes('Apple')
	) {
		return new VirtualDirectoryHandle(null, 'bridgeFolder', undefined)
	}

	return await navigator.storage.getDirectory()
}
