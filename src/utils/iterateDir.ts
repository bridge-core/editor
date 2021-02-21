export async function iterateDir(
	baseDirectory: FileSystemDirectoryHandle,
	callback: (fileHandle: FileSystemFileHandle) => Promise<void> | void
) {
	for await (const handle of baseDirectory.values()) {
		if (handle.kind === 'file') {
			if (handle.name[0] === '.') continue
			await callback(handle)
		} else if (handle.kind === 'directory') {
			await iterateDir(handle, callback)
		}
	}
}
