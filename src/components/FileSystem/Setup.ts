import { App } from '/@/App'
import { get, set } from 'idb-keyval'
import { SelectProjectFolderWindow } from '../Windows/Project/SelectFolder/SelectProjectFolder'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'

type TFileSystemSetupStatus = 'waiting' | 'userInteracted' | 'done'

export class FileSystemSetup {
	protected confirmPermissionWindow: InformationWindow | null = null
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
			const window = new SelectProjectFolderWindow(
				async (chosenFileHandle) => {
					if (chosenFileHandle) {
						await set('bridgeBaseDir', chosenFileHandle)
						fileHandle = chosenFileHandle
					}

					await this.verifyPermissions(chosenFileHandle)
				}
			)
			window.open()
			console.log(window)
			await window.fired
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
			this.confirmPermissionWindow = new InformationWindow({
				name: 'windows.projectFolder.title',
				description: 'windows.projectFolder.content',
				onClose: async () => {
					this._status = 'userInteracted'
					this.confirmPermissionWindow = null
					// Check if we already have permission && request permission if not
					if (
						(await fileHandle.requestPermission(opts)) !== 'granted'
					) {
						await this.verifyPermissions(fileHandle)
					}
				},
			})

			await this.confirmPermissionWindow.fired
		}

		// This checks whether the bridge directory still exists.
		// Might get a more elegant API in the future but this method works for now
		try {
			await fileHandle.getDirectoryHandle('data', { create: true })
		} catch {
			return undefined
		}
		return fileHandle
	}
}
