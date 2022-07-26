import {
	AnyDirectoryHandle,
	AnyFileHandle,
} from '/@/components/FileSystem/Types'

export async function loadAllFiles(
	directoryHandle: AnyDirectoryHandle,
	path = directoryHandle.name
) {
	if (path === '') path = '~local'

	const files: { handle: AnyFileHandle; path: string }[] = []

	for await (const handle of directoryHandle.values()) {
		if (handle.kind === 'file' && handle.name !== '.DS_Store') {
			files.push({
				handle,
				path: `${path}/${handle.name}`,
			})
		} else if (handle.kind === 'directory') {
			files.push(
				...(await loadAllFiles(handle, `${path}/${handle.name}`))
			)
		}
	}

	return files
}
