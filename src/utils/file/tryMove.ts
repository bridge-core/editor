import { dirExists } from './dirExists'
import { fileExists } from './fileExists'
import { AnyDirectoryHandle, AnyHandle } from '/@/components/FileSystem/Types'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'

interface IMoveFileOptions {
	toDirectory: AnyDirectoryHandle
	moveHandle: AnyHandle
	forceWrite?: boolean
}

export async function tryMove({
	toDirectory,
	moveHandle,
	forceWrite,
}: IMoveFileOptions) {
	const directoryExists = await dirExists(toDirectory, moveHandle.name)

	if (
		!forceWrite &&
		(directoryExists || (await fileExists(toDirectory, moveHandle.name)))
	) {
		const confirmWindow = new ConfirmationWindow({
			description: directoryExists
				? 'general.confirmOverwriteFolder'
				: 'general.confirmOverwriteFile',
		})
		const choice = await confirmWindow.fired

		if (choice) {
			await (<any>moveHandle).move(toDirectory)
			return 'overwrite'
		}

		return 'cancel'
	}

	await (<any>moveHandle).move(toDirectory)
	return 'move'
}
