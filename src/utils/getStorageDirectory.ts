import { VirtualDirectoryHandle } from '../components/FileSystem/Virtual/DirectoryHandle'

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
	if (
		typeof navigator.storage?.getDirectory !== 'function' ||
		!(await doesSupportWritable())
	) {
		return new VirtualDirectoryHandle(null, 'bridgeFolder', undefined)
	}

	return await navigator.storage.getDirectory()
}
