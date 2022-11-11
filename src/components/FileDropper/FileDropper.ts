import {
	AnyDirectoryHandle,
	AnyFileHandle,
	AnyHandle,
} from '/@/components/FileSystem/Types'
import { App } from '/@/App'
import { extname } from '/@/utils/path'

export class FileDropper {
	protected fileHandlers = new Map<
		string,
		(fileHandle: AnyFileHandle) => Promise<void> | void
	>()
	protected defaultImporter?: (
		fileHandle: AnyFileHandle
	) => Promise<void> | void

	constructor(protected app: App) {
		window.addEventListener('dragover', (event) => {
			event.preventDefault()
		})

		window.addEventListener('drop', (event) => {
			event.preventDefault()

			this.onDrop([...(event.dataTransfer?.items ?? [])])
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
		await this.app.projectManager.projectReady.fired

		const ext = extname(fileHandle.name)
		let handler = this.fileHandlers.get(ext) ?? this.defaultImporter

		if (!handler) return false

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
	setDefaultFileImporter(
		importHandler: (fileHandle: AnyFileHandle) => Promise<void> | void
	) {
		this.defaultImporter = importHandler

		return {
			dispose: () => (this.defaultImporter = undefined),
		}
	}
}
