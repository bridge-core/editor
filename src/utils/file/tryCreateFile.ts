import {
	AnyDirectoryHandle,
	AnyFileHandle,
} from '/@/components/FileSystem/Types'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'

interface ICreateFileOptions {
	directoryHandle: AnyDirectoryHandle
	name: string
	forceWrite?: boolean
}

interface ICreateResult {
	type: 'cancel' | 'overwrite' | 'create'
	handle?: AnyFileHandle
}

export async function tryCreateFile({
	directoryHandle,
	name,
	forceWrite,
}: ICreateFileOptions): Promise<ICreateResult> {
	let handle: AnyFileHandle
	try {
		handle = await directoryHandle.getFileHandle(name)
	} catch {
		handle = await directoryHandle.getFileHandle(name, { create: true })
		return {
			type: 'create',
			handle,
		}
	}

	if (forceWrite) return { type: 'overwrite', handle }

	const confirmWindow = new ConfirmationWindow({
		description: 'general.confirmOverwriteFile',
	})
	const choice = await confirmWindow.fired

	if (choice)
		return {
			type: 'overwrite',
			handle,
		}
	return { type: 'cancel' }
}
