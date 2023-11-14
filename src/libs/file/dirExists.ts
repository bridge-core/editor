import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'

export async function dirExists(
	directoryHandle: AnyDirectoryHandle,
	name: string
) {
	return directoryHandle
		.getDirectoryHandle(name)
		.then(() => true)
		.catch(() => false)
}
