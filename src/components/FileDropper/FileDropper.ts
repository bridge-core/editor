import {
	AnyDirectoryHandle,
	AnyFileHandle,
	AnyHandle,
} from '/@/components/FileSystem/Types'
import { App } from '/@/App'
import { extname } from '/@/utils/path'
import { listen } from '@tauri-apps/api/event'

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

		if (!import.meta.env.VITE_IS_TAURI_APP) {
			window.addEventListener('drop', (event) => {
				event.preventDefault()

				this.onDrop([...(event.dataTransfer?.items ?? [])])
			})
		} else {
			listen('tauri://file-drop', async (event) => {
				const paths: string[] = <string[]>event.payload

				const items: DataTransferItem[] = []

				for (const path of paths) {
					const posixPath = path.split('\\').join('/')

					if (await app.fileSystem.fileExists(posixPath)) {
						console.warn(`Getting file`)

						const fileHandle = <Promise<FileSystemHandle>>(
							app.fileSystem.getFileHandle(posixPath)
						)

						items.push({
							type: 'file',
							kind: 'file',
							getAsFile: () => null,
							getAsString: () => '',
							getAsFileSystemHandle: () => fileHandle,
							webkitGetAsEntry: () => null,
						})
					} else if (
						await app.fileSystem.directoryExists(posixPath)
					) {
						console.warn(`Getting directory`)

						const directoryHandle = <
							Promise<FileSystemDirectoryHandle>
						>app.fileSystem.getDirectoryHandle(posixPath)

						items.push({
							type: 'directory',
							kind: 'file',
							getAsFile: () => null,
							getAsString: () => '',
							getAsFileSystemHandle: () => directoryHandle,
							webkitGetAsEntry: () => null,
						})
					} else {
						console.warn(`${posixPath} does not exist!`)
					}
				}

				this.onDrop(items)
			})
		}
	}

	protected async onDrop(dataTransferItems: DataTransferItem[]) {
		const handles: Promise<AnyHandle | null>[] = []

		for (const item of dataTransferItems) {
			handles.push(
				<Promise<AnyHandle | null>>item.getAsFileSystemHandle()
			)
		}

		for (const handlePromise of handles) {
			const handle = await handlePromise

			if (handle === null) continue

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
