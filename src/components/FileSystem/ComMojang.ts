import { get, set } from 'idb-keyval'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { FileSystem } from './FileSystem'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { AnyDirectoryHandle } from './Types'

export const comMojangKey = 'comMojangDirectory'

export class ComMojang extends Signal<void> {
	public readonly fileSystem = new FileSystem()
	/**
	 * Stores whether com.mojang syncing is setup by the user
	 */
	public readonly setup = new Signal<void>()
	protected _hasComMojang = false
	protected permissionDenied = false

	get hasComMojang() {
		return this._hasComMojang
	}
	get status() {
		return {
			hasComMojang: this._hasComMojang,
			permissionDenied: this.permissionDenied,
		}
	}

	constructor(protected app: App) {
		super()

		get<AnyDirectoryHandle | undefined>(comMojangKey).then(
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
		directoryHandle: AnyDirectoryHandle
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

	protected async requestPermissions(directoryHandle: AnyDirectoryHandle) {
		const permission = await directoryHandle.requestPermission({
			mode: 'readwrite',
		})
		if (permission !== 'granted') {
			this._hasComMojang = false
			this.permissionDenied = true
			await this.app.projectManager.recompileAll()
		} else {
			this.fileSystem.setup(directoryHandle)
			this._hasComMojang = true
		}
	}

	async set(directoryHandle: AnyDirectoryHandle) {
		set(comMojangKey, directoryHandle)
		await this.requestPermissions(directoryHandle)
		if (this._hasComMojang) this.setup.dispatch()
	}

	async handleComMojangDrop(directoryHandle: AnyDirectoryHandle) {
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
