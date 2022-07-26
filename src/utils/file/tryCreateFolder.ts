import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'

interface ICreateFileOptions {
	directoryHandle: AnyDirectoryHandle
	name: string
	forceWrite?: boolean
}

interface ICreateResult {
	type: 'cancel' | 'overwrite' | 'create'
	handle?: AnyDirectoryHandle
}

export async function tryCreateFolder({
	directoryHandle,
	name,
	forceWrite,
}: ICreateFileOptions): Promise<ICreateResult> {
	let handle: AnyDirectoryHandle
	try {
		handle = await directoryHandle.getDirectoryHandle(name)
	} catch {
		handle = await directoryHandle.getDirectoryHandle(name, {
			create: true,
		})
		return {
			type: 'create',
			handle,
		}
	}

	if (forceWrite) return { type: 'overwrite', handle }

	const confirmWindow = new ConfirmationWindow({
		description: 'general.confirmOverwriteFolder',
	})
	const choice = await confirmWindow.fired

	if (choice)
		return {
			type: 'overwrite',
			handle,
		}
	return { type: 'cancel' }
}
