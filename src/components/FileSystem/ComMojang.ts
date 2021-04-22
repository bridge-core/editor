import { get, set } from 'idb-keyval'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { FileSystem } from './FileSystem'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'

const comMojangKey = 'comMojangDirectory'

export class ComMojang extends Signal<void> {
	public readonly fileSystem = new FileSystem()
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
					await this.requestPermissions(directoryHandle)
				}
				this.dispatch()
			}
		)
	}

	protected async requestPermissions(
		directoryHandle: FileSystemDirectoryHandle
	) {
		const informWindow = new InformationWindow({
			name: 'comMojang.title',
			description: 'comMojang.permissionRequest',
			onClose: async () => {
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
			},
		})

		await informWindow.fired
	}

	async set(directoryHandle: FileSystemDirectoryHandle) {
		set(comMojangKey, directoryHandle)
		await this.requestPermissions(directoryHandle)
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
