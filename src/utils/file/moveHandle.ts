import { iterateDir } from '../iterateDir'
import {
	AnyDirectoryHandle,
	AnyFileHandle,
	AnyHandle,
} from '/@/components/FileSystem/Types'
import { VirtualHandle } from '/@/components/FileSystem/Virtual/Handle'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { dirname } from '../path'
import { tryCreateFile } from './tryCreateFile'
import { tryMove } from './tryMove'
import { dirExists } from './dirExists'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'

interface IMoveOptions<T = FileSystemHandle | VirtualHandle> {
	fromHandle?: AnyDirectoryHandle
	toHandle: AnyDirectoryHandle
	moveHandle: T
}

interface IMoveResult {
	type: 'cancel' | 'overwrite' | 'move'
	handle?: AnyHandle
}

export async function moveHandle(opts: IMoveOptions): Promise<IMoveResult> {
	if (opts.moveHandle.kind === 'file')
		return await moveFileHandle(<IMoveOptions<AnyFileHandle>>opts)
	else if (opts.moveHandle.kind === 'directory')
		return await moveDirectoryHandle(<IMoveOptions<AnyDirectoryHandle>>opts)

	return {
		type: 'cancel',
	}
}

export async function moveFileHandle(
	{ fromHandle, toHandle, moveHandle }: IMoveOptions<AnyFileHandle>,
	forceWrite = false
): Promise<IMoveResult> {
	if (typeof (<any>moveHandle).move === 'function') {
		const moveStatus = await tryMove({
			toDirectory: toHandle,
			moveHandle,
			forceWrite,
		})

		if (moveStatus !== 'moveFailed')
			return {
				type: moveStatus,
				handle: moveHandle,
			}
	}

	// Move is not available, we need to copy over the file manually
	// 1. Get original file content
	const file = await moveHandle.getFile()
	// 2. Create new file
	const { type, handle: newHandle } = await tryCreateFile({
		directoryHandle: toHandle,
		name: moveHandle.name,
		forceWrite,
	})
	if (!newHandle)
		return {
			type: 'cancel',
		}

	// 3. Write file content to new file
	const writable = await newHandle.createWritable()
	await writable.write(file)
	await writable.close()
	// 4. Delete old file
	if (fromHandle) await fromHandle.removeEntry(moveHandle.name)

	return {
		type: type === 'overwrite' ? 'overwrite' : 'move',
		handle: newHandle,
	}
}

async function moveDirectoryHandle({
	fromHandle,
	toHandle,
	moveHandle,
}: IMoveOptions<AnyDirectoryHandle>): Promise<IMoveResult> {
	if (typeof (<any>moveHandle).move === 'function') {
		const moveStatus = await tryMove({
			moveHandle,
			toDirectory: toHandle,
		})

		if (moveStatus !== 'moveFailed')
			return {
				type: moveStatus,
				handle: moveHandle,
			}
	}

	// Native move is not availble, we need to manually move over the folder
	const destFs = new FileSystem(toHandle)

	let type: 'move' | 'overwrite' = 'move'
	if (await dirExists(toHandle, moveHandle.name)) {
		type = 'overwrite'
		const confirmWindow = new ConfirmationWindow({
			description: 'general.confirmOverwriteFolder',
		})
		const choice = await confirmWindow.fired

		if (!choice) return { type: 'cancel' }
	}

	const newHandle = await destFs.getDirectoryHandle(moveHandle.name, {
		create: true,
	})

	await iterateDir(
		moveHandle,
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
		moveHandle.name
	)

	if (fromHandle)
		await fromHandle.removeEntry(moveHandle.name, { recursive: true })
	return {
		type,
		handle: newHandle,
	}
}
