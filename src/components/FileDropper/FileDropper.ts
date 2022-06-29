import { reactive } from 'vue'
import {
	isUsingOriginPrivateFs,
	isUsingFileSystemPolyfill,
} from '/@/components/FileSystem/Polyfill'
import {
	AnyDirectoryHandle,
	AnyFileHandle,
	AnyHandle,
} from '/@/components/FileSystem/Types'
import { App } from '/@/App'
import { extname } from '/@/utils/path'

export interface IDropState {
	isHovering: boolean
}

export class FileDropper {
	public readonly state = reactive<IDropState>({
		isHovering: false,
	})
	protected fileHandlers = new Map<
		string,
		(fileHandle: AnyFileHandle) => Promise<void> | void
	>()

	constructor(protected app: App) {
		window.addEventListener('dragover', (event) => {
			event.preventDefault()

			if (App.windowState.isAnyWindowVisible.value) return

			// Moving tabs
			if (event.dataTransfer?.effectAllowed === 'move') return

			this.state.isHovering = true
		})

		window.addEventListener('mouseout', (event) => {
			event.preventDefault()

			if (event.relatedTarget == null) {
				this.state.isHovering = false
			}
		})

		window.addEventListener('dragend', (event) => {
			event.preventDefault()
			this.state.isHovering = false
		})

		window.addEventListener('drop', (event) => {
			event.preventDefault()

			if (App.windowState.isAnyWindowVisible.value) return

			this.onDrop([...(event.dataTransfer?.items ?? [])])
			this.state.isHovering = false
		})
	}

	protected async onDrop(dataTransferItems: DataTransferItem[]) {
		for (const item of dataTransferItems) {
			const handle = <AnyHandle | null>await item.getAsFileSystemHandle()
			if (!handle) return

			await this.import(handle)
		}
	}

	async import(handle: AnyHandle) {
		if (handle.kind === 'directory') {
			await this.importFolder(handle)
		} else if (handle.kind === 'file') {
			await this.importFile(handle)
		}
	}

	async importFile(fileHandle: AnyFileHandle) {
		const ext = extname(fileHandle.name)
		const handler = this.fileHandlers.get(ext)

		if (!handler) {
			return false
		}

		try {
			await handler(fileHandle)
		} catch (err) {
			console.error(err)
			return false
		}
		return true
	}

	async importFolder(directoryHandle: AnyDirectoryHandle) {
		await this.app.folderImportManager.onImportFolder(directoryHandle)
	}

	addFileImporter(
		ext: string,
		importHandler: (fileHandle: AnyFileHandle) => Promise<void> | void
	) {
		if (this.fileHandlers.has(ext))
			throw new Error(`Handler for ${ext} already exists`)

		this.fileHandlers.set(ext, importHandler)

		return {
			dispose: () => this.fileHandlers.delete(ext),
		}
	}
}
