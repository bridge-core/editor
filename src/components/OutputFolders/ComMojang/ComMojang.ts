import { del, get, set } from 'idb-keyval'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { VirtualDirectoryHandle } from '../../FileSystem/Virtual/DirectoryHandle'
import { TauriFsStore } from '../../FileSystem/Virtual/Stores/TauriFs'
import { basename, join } from '/@/utils/path'
import { platform } from '/@/utils/os'

export const comMojangKey = 'comMojangDirectory'

export class ComMojang extends Signal<void> {
	public readonly fileSystem = new FileSystem()
	/**
	 * Stores whether com.mojang syncing is setup by the user
	 */
	public readonly setup = new Signal<void>()
	protected _hasComMojang = false
	protected _permissionDenied = false
	protected _hasComMojangHandle = false

	get hasComMojang() {
		return this._hasComMojang
	}
	get hasComMojangHandle() {
		return this._hasComMojangHandle
	}
	get status() {
		return {
			hasComMojang: this._hasComMojang,
			didDenyPermission: this._permissionDenied,
		}
	}

	constructor(protected app: App) {
		super()
	}
	async setupComMojang() {
		if (this._hasComMojang) return false

		let directoryHandle = await get<
			AnyDirectoryHandle | string | undefined
		>(comMojangKey)

		// Auto-infer com.mojang folder for Tauri builds on windows
		if (
			import.meta.env.VITE_IS_TAURI_APP &&
			directoryHandle === undefined &&
			platform() === 'win32'
		) {
			const { join, homeDir } = await import('@tauri-apps/api/path')

			directoryHandle = await join(
				await homeDir(),
				'AppData\\Roaming\\Minecraft Bedrock\\Users\\Shared\\games\\com.mojang'
			)
		}

		if (typeof directoryHandle === 'string') {
			if (!import.meta.env.VITE_IS_TAURI_APP)
				throw new Error(
					'Cannot use path reference to com.mojang directoryHandle outside of Tauri builds'
				)

			const dirName = basename(directoryHandle)
			directoryHandle = new VirtualDirectoryHandle(
				new TauriFsStore(directoryHandle),
				dirName
			)
		}

		this._hasComMojangHandle = directoryHandle !== undefined

		if (directoryHandle) {
			await this.requestPermissions(directoryHandle).catch(async () => {
				// Permission request failed because user activation was too long ago
				// -> Create window to get new activation
				await this.createPermissionWindow(
					<AnyDirectoryHandle>directoryHandle
				)
			})

			if (this._hasComMojang) {
				this.setup.dispatch()
				this.dispatch()
				return true
			}
		}

		this.dispatch()
		return false
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
		if (directoryHandle instanceof VirtualDirectoryHandle) {
			const store = directoryHandle.getBaseStore()
			if (!(store instanceof TauriFsStore))
				throw new Error(
					'Cannot set com.mojang directoryHandle to non-tauri-backed store'
				)

			set(comMojangKey, store.getBaseDirectory())
		} else {
			set(comMojangKey, directoryHandle)
		}

		await this.requestPermissions(directoryHandle)
		if (this._hasComMojang) this.setup.dispatch()

		this._hasComMojangHandle = true
		this.dispatch()
	}

	async handleComMojangDrop(directoryHandle: AnyDirectoryHandle) {
		// User wants to set default com.mojang folder
		await this.set(directoryHandle)
		if (this._hasComMojang) await this.app.projectManager.recompileAll()
	}

	async unlink() {
		await this.app.projectManager.recompileAll()
		await del(comMojangKey)
	}
}
