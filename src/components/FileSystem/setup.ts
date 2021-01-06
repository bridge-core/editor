import { translate } from '@/utils/locales'
import { get, set } from 'idb-keyval'
import { createInformationWindow } from '../Windows/Common/CommonDefinitions'
import { TWindow } from '../Windows/create'
import { createSelectProjectFolderWindow } from '../Windows/Project/SelectFolder/definition'
import { FileSystem } from './Main'

export async function setupFileSystem() {
	const fileHandle = await get<FileSystemDirectoryHandle>('bridgeBaseDir')
	if (!fileHandle)
		await createSelectProjectFolderWindow(async fileHandle => {
			if (fileHandle) await set('bridgeBaseDir', fileHandle)

			await verifyPermissions(fileHandle)
		}).status.done
	else await verifyPermissions(fileHandle)

	return new FileSystem(fileHandle)
}

let confirmPermissionWindow: TWindow | null = null
async function verifyPermissions(fileHandle: FileSystemDirectoryHandle) {
	const opts = { writable: true, mode: 'readwrite' } as const

	if (
		(await fileHandle.queryPermission(opts)) !== 'granted' &&
		confirmPermissionWindow === null
	) {
		confirmPermissionWindow = createInformationWindow(
			'windows.projectFolder.title',
			'windows.projectFolder.content',
			async () => {
				confirmPermissionWindow = null
				// Check if we already have permission && request permission if not
				if ((await fileHandle.requestPermission(opts)) !== 'granted') {
					await verifyPermissions(fileHandle)
				}
			}
		)

		await confirmPermissionWindow.status.done
	}
}
