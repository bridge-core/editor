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
		if (handle.kind === 'file')
			files.push({
				handle,
				path: `${path}/${handle.name}`,
			})
		else
			files.push(
				...(await loadAllFiles(handle, `${path}/${handle.name}`))
			)
	}

	return files
}
