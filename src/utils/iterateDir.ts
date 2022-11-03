import {
	AnyDirectoryHandle,
	AnyFileHandle,
} from '../components/FileSystem/Types'

export async function iterateDir(
	baseDirectory: AnyDirectoryHandle,
	callback: (
		fileHandle: AnyFileHandle,
		path: string,
		fromDirectory: AnyDirectoryHandle
	) => Promise<void> | void,
	ignoreFolders: Set<string> = new Set(),
	path = ''
) {
	for await (const handle of baseDirectory.values()) {
		const currentPath =
			path.length === 0 ? handle.name : `${path}/${handle.name}`

		if (handle.kind === 'file') {
			if (handle.name[0] === '.') continue

			await callback(handle, currentPath, baseDirectory)
		} else if (
			handle.kind === 'directory' &&
			!ignoreFolders.has(currentPath)
		) {
			await iterateDir(handle, callback, ignoreFolders, currentPath)
		}
	}
}

export async function iterateDirParallel(
	baseDirectory: AnyDirectoryHandle,
	callback: (
		fileHandle: AnyFileHandle,
		path: string,
		fromDirectory: AnyDirectoryHandle
	) => Promise<void> | void,
	ignoreFolders: Set<string> = new Set(),
	path = ''
) {
	const promises = []

	for await (const handle of baseDirectory.values()) {
		const currentPath =
			path.length === 0 ? handle.name : `${path}/${handle.name}`

		if (handle.kind === 'file') {
			if (handle.name[0] === '.') continue

			promises.push(callback(handle, currentPath, baseDirectory))
		} else if (
			handle.kind === 'directory' &&
			!ignoreFolders.has(currentPath)
		) {
			promises.push(
				iterateDirParallel(handle, callback, ignoreFolders, currentPath)
			)
		}
	}

	await Promise.all(promises)
}
