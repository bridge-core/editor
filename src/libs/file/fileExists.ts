import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'

export async function fileExists(
	directoryHandle: AnyDirectoryHandle,
	name: string
) {
	return directoryHandle
		.getFileHandle(name)
		.then(() => true)
		.catch(() => false)
}
