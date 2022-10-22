import { dirExists } from './dirExists'
import { fileExists } from './fileExists'
import { AnyDirectoryHandle, AnyHandle } from '/@/components/FileSystem/Types'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'

interface IRenameFileOptions {
	newName: string
	parentHandle: AnyDirectoryHandle
	renameHandle: AnyHandle
	forceWrite?: boolean
}

export async function tryRename({
	newName,
	parentHandle,
	renameHandle,
	forceWrite,
}: IRenameFileOptions) {
	const directoryExists = await dirExists(parentHandle, newName)

	let type: 'rename' | 'overwrite' = 'rename'
	if (
		!forceWrite &&
		(directoryExists || (await fileExists(parentHandle, newName)))
	) {
		const confirmWindow = new ConfirmationWindow({
			description: directoryExists
				? 'general.confirmOverwriteFolder'
				: 'general.confirmOverwriteFile',
		})
		const choice = await confirmWindow.fired

		if (!choice) return 'cancel'

		type = 'overwrite'
	}

	try {
		await (<any>renameHandle).move(newName)
		return type
	} catch {
		return 'renameFailed'
	}
}
