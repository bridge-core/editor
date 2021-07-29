import {
	AnyDirectoryHandle,
	AnyFileHandle,
} from '../components/FileSystem/Types'

export async function iterateDir(
	baseDirectory: AnyDirectoryHandle,
	callback: (fileHandle: AnyFileHandle, path: string) => Promise<void> | void,
	ignoreFolders: Set<string> = new Set(),
	path = ''
) {
	for await (const handle of baseDirectory.values()) {
		const currentPath =
			path.length === 0 ? handle.name : `${path}/${handle.name}`

		if (handle.kind === 'file') {
			if (handle.name[0] === '.') continue
			await callback(handle, currentPath)
		} else if (
			handle.kind === 'directory' &&
			!ignoreFolders.has(currentPath)
		) {
			await iterateDir(handle, callback, ignoreFolders, currentPath)
		}
	}
}
