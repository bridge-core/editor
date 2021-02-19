import { App } from '/@/App'
import { get, set } from 'idb-keyval'
import { createInformationWindow } from '../Windows/Common/CommonDefinitions'
import { TWindow } from '../Windows/create'
import { createSelectProjectFolderWindow } from '../Windows/Project/SelectFolder/definition'

type TFileSystemSetupStatus = 'waiting' | 'userInteracted' | 'done'

export class FileSystemSetup {
	protected confirmPermissionWindow: TWindow | null = null
	protected _status: TFileSystemSetupStatus = 'waiting'
	get status() {
		return this._status
	}

	setStatus(status: TFileSystemSetupStatus) {
		this._status = status
	}

	async setupFileSystem(app: App) {
		if (typeof window.showDirectoryPicker !== 'function') {
			// The user's browser doesn't support the native file system API
			app.windows.browserUnsupported.open()
			return false
		}

		let fileHandle = await get<FileSystemDirectoryHandle | undefined>(
			'bridgeBaseDir'
		)
		// Request permissions to current bridge folder
		if (fileHandle) fileHandle = await this.verifyPermissions(fileHandle)

		// There's currently no bridge folder yet/the bridge folder has been deleted
		if (!fileHandle) {
			await createSelectProjectFolderWindow(async chosenFileHandle => {
				if (chosenFileHandle) {
					await set('bridgeBaseDir', chosenFileHandle)
					fileHandle = chosenFileHandle
				}

				await this.verifyPermissions(chosenFileHandle)
			}).status.done
		}

		this._status = 'done'
		return fileHandle
	}
	async verifyPermissions(fileHandle: FileSystemDirectoryHandle) {
		const opts = { writable: true, mode: 'readwrite' } as const

		if (
			(await fileHandle.queryPermission(opts)) !== 'granted' &&
			this.confirmPermissionWindow === null
		) {
			this.confirmPermissionWindow = createInformationWindow(
				'windows.projectFolder.title',
				'windows.projectFolder.content',
				async () => {
					this._status = 'userInteracted'
					this.confirmPermissionWindow = null
					// Check if we already have permission && request permission if not
					if (
						(await fileHandle.requestPermission(opts)) !== 'granted'
					) {
						await this.verifyPermissions(fileHandle)
					}
				}
			)

			await this.confirmPermissionWindow.status.done
		}

		// This checks whether the bridge directory still exists.
		// Might get a more elegant API in the future but that's all we can do for now
		try {
			await fileHandle.getDirectoryHandle('data', { create: true })
		} catch {
			return undefined
		}
		return fileHandle
	}
}
