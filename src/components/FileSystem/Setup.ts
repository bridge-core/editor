import { App } from '/@/App'
import { get, set } from 'idb-keyval'
import { InitialSetup } from '/@/components/InitialSetup/InitialSetup'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { ref } from '@vue/composition-api'
import { Signal } from '../Common/Event/Signal'
import { AnyDirectoryHandle } from './Types'
import { VirtualDirectoryHandle } from './Virtual/DirectoryHandle'
import { isUsingFileSystemPolyfill } from './Polyfill'
import { has as hasVirtualDirectory } from './Virtual/IDB'

type TFileSystemSetupStatus = 'waiting' | 'userInteracted' | 'done'

export class FileSystemSetup {
	static state = {
		showInitialSetupDialog: ref(false),
		receiveDirectoryHandle: new Signal<AnyDirectoryHandle>(),
		setupDone: new Signal<void>(),
	}

	protected confirmPermissionWindow: InformationWindow | null = null
	protected _status: TFileSystemSetupStatus = 'waiting'
	get status() {
		return this._status
	}

	setStatus(status: TFileSystemSetupStatus) {
		this._status = status
	}

	async setupFileSystem(app: App) {
		let fileHandle = await get<AnyDirectoryHandle | undefined>(
			'bridgeBaseDir'
		)
		// Request permissions to current bridge folder
		if (fileHandle) fileHandle = await this.verifyPermissions(fileHandle)

		// Test whether the user has a virtual file system setup
		if (await hasVirtualDirectory('bridgeFolder')) {
			fileHandle = new VirtualDirectoryHandle(
				null,
				'bridgeFolder',
				undefined
			)
			await fileHandle.setupDone.fired
		}

		// There's currently no bridge folder yet/the bridge folder has been deleted
		if (!fileHandle) {
			const globalState = FileSystemSetup.state
			globalState.showInitialSetupDialog.value = true
			fileHandle = await globalState.receiveDirectoryHandle.fired

			await this.verifyPermissions(fileHandle)
			if (!(fileHandle instanceof VirtualDirectoryHandle))
				await set('bridgeBaseDir', fileHandle)

			globalState.setupDone.dispatch()
		} else {
			InitialSetup.ready.dispatch()
		}

		if (
			isUsingFileSystemPolyfill &&
			!(await get<boolean>('confirmedUnsupportedBrowser'))
		) {
			// The user's browser doesn't support the native file system API
			app.windows.browserUnsupported.open()
		}

		this._status = 'done'
		return fileHandle
	}
	async verifyPermissions(
		fileHandle: AnyDirectoryHandle,
		tryImmediateRequest = true
	) {
		const opts = { writable: true, mode: 'readwrite' } as const

		// An additional user activation is no longer needed from Chromium 92 onwards.
		// We can show our first prompt without an additional InformationWindow!
		try {
			if (
				tryImmediateRequest &&
				(await fileHandle.requestPermission(opts)) !== 'granted'
			) {
				await this.verifyPermissions(fileHandle, false)
			}
		} catch {}

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
						await this.verifyPermissions(fileHandle, false)
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
