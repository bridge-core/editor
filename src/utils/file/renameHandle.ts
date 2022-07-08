import { tryCreateFile } from './tryCreateFile'
import { tryRename } from './tryRename'
import {
	AnyDirectoryHandle,
	AnyFileHandle,
	AnyHandle,
} from '/@/components/FileSystem/Types'
import { VirtualHandle } from '/@/components/FileSystem/Virtual/Handle'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { dirExists } from './dirExists'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { iterateDir } from '../iterateDir'
import { moveFileHandle } from './moveHandle'
import { dirname } from '/@/utils/path'

interface IRenameOptions<T = FileSystemHandle | VirtualHandle> {
	newName: string
	renameHandle: T
	parentHandle: AnyDirectoryHandle
}

interface IRenameResult {
	type: 'cancel' | 'overwrite' | 'rename'
	handle?: AnyHandle
}

export async function renameHandle(
	opts: IRenameOptions
): Promise<IRenameResult> {
	if (opts.renameHandle.kind === 'file')
		return await renameFileHandle(<IRenameOptions<AnyFileHandle>>opts)
	else if (opts.renameHandle.kind === 'directory')
		return await renameDirectoryHandle(
			<IRenameOptions<AnyDirectoryHandle>>opts
		)

	return {
		type: 'cancel',
	}
}

async function renameFileHandle(
	{ renameHandle, newName, parentHandle }: IRenameOptions<AnyFileHandle>,
	forceWrite = false
): Promise<IRenameResult> {
	if (typeof (<any>renameHandle).move === 'function') {
		const renameStatus = await tryRename({
			parentHandle,
			renameHandle,
			newName,
			forceWrite,
		})

		if (renameStatus !== 'renameFailed')
			return {
				type: renameStatus,
				handle: renameHandle,
			}
	}

	// Move is not available, we need to copy over the file manually
	// 1. Get original file content
	const file = await renameHandle.getFile()
	// 2. Create new file
	const { type, handle: newHandle } = await tryCreateFile({
		directoryHandle: parentHandle,
		name: newName,
		forceWrite,
	})
	if (!newHandle) return { type: 'cancel' }

	// 3. Write file content to new file
	const writable = await newHandle.createWritable()
	await writable.write(file)
	await writable.close()
	// 4. Delete old file
	await parentHandle.removeEntry(renameHandle.name)

	return {
		type: type === 'create' ? 'rename' : 'overwrite',
		handle: newHandle,
	}
}

async function renameDirectoryHandle({
	parentHandle,
	renameHandle,
	newName,
}: IRenameOptions<AnyDirectoryHandle>): Promise<IRenameResult> {
	if (typeof (<any>renameHandle).move === 'function') {
		const result = await tryRename({
			parentHandle,
			renameHandle,
			newName,
		})

		if (result !== 'renameFailed')
			return {
				type: result,
				handle: renameHandle,
			}
	}

	// Native move is not available, we need to manually move over the folder
	const destFs = new FileSystem(parentHandle)
	const oldName = renameHandle.name

	let type: 'rename' | 'overwrite' = 'rename'
	if (await dirExists(parentHandle, newName)) {
		type = 'overwrite'
		const confirmWindow = new ConfirmationWindow({
			description: 'general.confirmOverwriteFolder',
		})
		const choice = await confirmWindow.fired

		if (!choice) return { type: 'cancel' }
	}

	const newHandle = await destFs.getDirectoryHandle(newName, {
		create: true,
	})

	await iterateDir(
		renameHandle,
		async (fileHandle, filePath, fromHandle) => {
			await moveFileHandle(
				{
					moveHandle: fileHandle,
					fromHandle,
					toHandle: await destFs.getDirectoryHandle(
						dirname(filePath),
						{
							create: true,
						}
					),
				},
				true
			)
		},
		new Set(),
		newName
	)

	if (parentHandle)
		await parentHandle.removeEntry(oldName, { recursive: true })

	return {
		type,
		handle: newHandle,
	}
}
