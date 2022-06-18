import { App } from '/@/App'
import { get, set } from 'idb-keyval'
import { InitialSetup } from '/@/components/InitialSetup/InitialSetup'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { ref } from '@vue/composition-api'
import { Signal } from '../Common/Event/Signal'
import { AnyDirectoryHandle } from './Types'
import { VirtualDirectoryHandle } from './Virtual/DirectoryHandle'
import { isUsingFileSystemPolyfill, isUsingOriginPrivateFs } from './Polyfill'
import { has as hasVirtualDirectory } from './Virtual/IDB'
import { ConfirmationWindow } from '../Windows/Common/Confirm/ConfirmWindow'
import { FileSystem } from './FileSystem'

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

		if (!isUsingFileSystemPolyfill.value && fileHandle) {
			// Request permissions to current bridge folder
			fileHandle = await this.verifyPermissions(fileHandle)
		}

		let isUpgradingVirtualFs = false

		// Test whether the user has a virtual file system setup
		if (
			isUsingFileSystemPolyfill.value ||
			(await hasVirtualDirectory('bridgeFolder'))
		) {
			if (!isUsingFileSystemPolyfill.value) {
				// Ask user whether to upgrade to the real file system
				const confirmWindow = new ConfirmationWindow({
					title: 'windows.upgradeFs.title',
					description: 'windows.upgradeFs.description',
					cancelText: 'general.later',
					onCancel: () => {
						isUsingFileSystemPolyfill.value = true
					},
					onConfirm: async () => {
						isUpgradingVirtualFs = true
						isUsingFileSystemPolyfill.value = false
					},
				})

				await confirmWindow.fired
			}

			// Only create virtual folder if we are not migrating away from the virtual file system
			if (!isUpgradingVirtualFs) {
				fileHandle = new VirtualDirectoryHandle(
					null,
					'bridgeFolder',
					undefined
				)
				await fileHandle.setupDone.fired
			}
		}

		// There's currently no bridge folder yet/the bridge folder has been deleted
		if (!fileHandle) {
			const globalState = FileSystemSetup.state
			globalState.showInitialSetupDialog.value = true
			fileHandle = isUsingOriginPrivateFs
				? await window.showDirectoryPicker()
				: await globalState.receiveDirectoryHandle.fired

			await this.verifyPermissions(fileHandle)

			// Safari doesn't support storing file handles inside of IndexedDB yet
			try {
				if (!(fileHandle instanceof VirtualDirectoryHandle))
					await set('bridgeBaseDir', fileHandle)
			} catch {}

			globalState.setupDone.dispatch()
		}

		if (
			isUsingFileSystemPolyfill.value &&
			!(await get<boolean>('confirmedUnsupportedBrowser'))
		) {
			// The user's browser doesn't support the native file system API
			app.windows.browserUnsupported.open()
		}

		// Migrate virtual project over
		if (isUpgradingVirtualFs) {
			const virtualFolder = new VirtualDirectoryHandle(
				null,
				'bridgeFolder',
				undefined
			)
			await virtualFolder.setupDone.fired

			const fs = new FileSystem(fileHandle)
			await fs.copyFolderByHandle(virtualFolder, fileHandle)

			await virtualFolder.removeSelf()
		}

		this._status = 'done'
		return fileHandle
	}
	async verifyPermissions(
		fileHandle: AnyDirectoryHandle,
		tryImmediateRequest = true
	) {
		// Safari doesn't support these functions just yet
		if (
			typeof fileHandle.requestPermission !== 'function' ||
			typeof fileHandle.queryPermission !== 'function'
		) {
			// Create the data directory and return
			await fileHandle.getDirectoryHandle('data', { create: true })
			return fileHandle
		}

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
