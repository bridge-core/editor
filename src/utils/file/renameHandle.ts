import { tryCreateFile } from './tryCreateFile'
import {
	AnyDirectoryHandle,
	AnyFileHandle,
} from '/@/components/FileSystem/Types'
import { VirtualHandle } from '/@/components/FileSystem/Virtual/Handle'

interface IRenameOptions<T = FileSystemHandle | VirtualHandle> {
	newName: string
	renameHandle: T
	parentHandle: AnyDirectoryHandle
}

export async function renameHandle(opts: IRenameOptions) {
	if (opts.renameHandle.kind === 'file')
		return await renameFileHandle(<IRenameOptions<AnyFileHandle>>opts)
	// else if (opts.moveHandle.kind === 'directory')
	// return await moveDirectoryHandle(<IRenameOptions<AnyDirectoryHandle>>opts)
}

async function renameFileHandle(
	{ renameHandle, newName, parentHandle }: IRenameOptions<AnyFileHandle>,
	forceWrite = false
) {
	if (typeof (<any>renameHandle).move === 'function')
		return await (<any>renameHandle).move(newName)

	// Move is not available, we need to copy over the file manually
	// 1. Get original file content
	const file = await renameHandle.getFile()
	// 2. Create new file
	const { handle: newHandle } = await tryCreateFile({
		directoryHandle: parentHandle,
		name: newName,
		forceWrite,
	})
	if (!newHandle) return
	// 3. Write file content to new file
	const writable = await newHandle.createWritable()
	await writable.write(file)
	await writable.close()
	// 4. Delete old file
	await parentHandle.removeEntry(newName)

	return newHandle
}
