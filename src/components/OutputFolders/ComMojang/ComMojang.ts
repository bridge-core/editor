import { del, get, set } from 'idb-keyval'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { FileSystem } from '../../FileSystem/FileSystem'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { InformationWindow } from '../../Windows/Common/Information/InformationWindow'
import { AnyDirectoryHandle } from '../../FileSystem/Types'

export const comMojangKey = 'comMojangDirectory'

export class ComMojang extends Signal<void> {
	public readonly fileSystem = new FileSystem()
	/**
	 * Stores whether com.mojang syncing is setup by the user
	 */
	public readonly setup = new Signal<void>()
	protected _hasComMojang = false
	protected _permissionDenied = false

	get hasComMojang() {
		return this._hasComMojang
	}
	get status() {
		return {
			hasComMojang: this._hasComMojang,
			didDenyPermission: this._permissionDenied,
		}
	}

	constructor(protected app: App) {
		super()

		get<AnyDirectoryHandle | undefined>(comMojangKey).then(
			async (directoryHandle) => {
				if (directoryHandle) {
					await this.requestPermissions(directoryHandle).catch(
						async () => {
							// Permission request failed because user activation was too long ago
							// -> Create window to get new activation
							await this.createPermissionWindow(directoryHandle)
						}
					)
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
		})
		informWindow.open()

		await informWindow.fired
		await this.requestPermissions(directoryHandle)
	}

	protected async requestPermissions(directoryHandle: AnyDirectoryHandle) {
		const permission = await directoryHandle.requestPermission({
			mode: 'readwrite',
		})

		if (permission !== 'granted') {
			this._hasComMojang = false
			this._permissionDenied = true
			this.app.projectManager.recompileAll()
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

	async unlink() {
		await this.app.projectManager.recompileAll()
		await del(comMojangKey)
	}
}
