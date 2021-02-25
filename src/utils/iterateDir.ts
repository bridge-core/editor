export async function iterateDir(
	baseDirectory: FileSystemDirectoryHandle,
	callback: (
		fileHandle: FileSystemFileHandle,
		path: string
	) => Promise<void> | void,
	path = ''
) {
	for await (const handle of baseDirectory.values()) {
		const currentPath =
			path.length === 0 ? handle.name : `${path}/${handle.name}`

		if (handle.kind === 'file') {
			if (handle.name[0] === '.') continue
			await callback(handle, currentPath)
		} else if (handle.kind === 'directory') {
			await iterateDir(handle, callback, currentPath)
		}
	}
}
