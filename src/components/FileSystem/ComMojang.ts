import { get, set } from 'idb-keyval'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { FileSystem } from './FileSystem'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'

export const comMojangKey = 'comMojangDirectory'

export class ComMojang extends Signal<void> {
	public readonly fileSystem = new FileSystem()
	/**
	 * Stores whether com.mojang syncing is setup by the user
	 */
	public readonly setup = new Signal<void>()
	protected _hasComMojang = false

	get hasComMojang() {
		return this._hasComMojang
	}

	constructor(protected app: App) {
		super()

		get<FileSystemDirectoryHandle | undefined>(comMojangKey).then(
			async (directoryHandle) => {
				if (directoryHandle) {
					await this.app.fileSystem.fired
					await this.requestPermissions(directoryHandle).catch(() => {
						// Permission request failed because user activation was too long ago
						// -> Create window to get new activation
						this.createPermissionWindow(directoryHandle)
					})
					if (this._hasComMojang) this.setup.dispatch()
				}
				this.dispatch()
			}
		)
	}

	protected async createPermissionWindow(
		directoryHandle: FileSystemDirectoryHandle
	) {
		const informWindow = new InformationWindow({
			name: 'comMojang.title',
			description: 'comMojang.permissionRequest',
			onClose: async () => {
				await this.requestPermissions(directoryHandle)
			},
		})
		informWindow.open()

		await informWindow.fired
	}

	protected async requestPermissions(
		directoryHandle: FileSystemDirectoryHandle
	) {
		const permission = await directoryHandle.requestPermission({
			mode: 'readwrite',
		})
		if (permission !== 'granted') {
			set(comMojangKey, undefined)
			await this.app.projectManager.recompileAll(false)
		} else {
			this.fileSystem.setup(directoryHandle)
			this._hasComMojang = true
		}
	}

	async set(directoryHandle: FileSystemDirectoryHandle) {
		set(comMojangKey, directoryHandle)
		await this.requestPermissions(directoryHandle)
		if (this._hasComMojang) this.setup.dispatch()
	}

	async handleComMojangDrop(directoryHandle: FileSystemDirectoryHandle) {
		const confirmWindow = new ConfirmationWindow({
			description: 'comMojang.folderDropped',
			confirmText: 'general.yes',
			cancelText: 'general.no',
		})

		// User wants to set default com.mojang folder
		if (await confirmWindow.fired) {
			await this.set(directoryHandle)
			await this.app.projectManager.recompileAll()
		}
	}
}
