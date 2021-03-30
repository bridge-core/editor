import Vue from 'vue'
import { extname } from '/@/utils/path'

export interface IDropState {
	isHovering: boolean
	failedImports: string[]
}

export class FileDropper {
	public readonly state = Vue.observable<IDropState>({
		isHovering: false,
		failedImports: [],
	})
	protected fileHandlers = new Map<
		string,
		(fileHandle: FileSystemFileHandle) => Promise<void> | void
	>()
	protected closeTimeout?: number

	constructor() {
		window.addEventListener('dragover', (event) => {
			event.preventDefault()

			// Moving tabs
			if (event.dataTransfer?.effectAllowed === 'move') return

			if (this.closeTimeout) window.clearTimeout(this.closeTimeout)

			this.state.failedImports = []
			this.state.isHovering = true
		})

		window.addEventListener('mouseout', (event) => {
			event.preventDefault()

			if (event.relatedTarget == null) {
				if (!this.closeTimeout) {
					this.state.isHovering = false
				}
			}
		})

		window.addEventListener('dragend', () => {
			if (!this.closeTimeout) {
				this.state.isHovering = false
			}
		})

		window.addEventListener('drop', (event) => {
			event.preventDefault()

			this.onDrop([...(event.dataTransfer?.items ?? [])])
		})

		if ('launchQueue' in window) {
			;(<any>window).launchQueue.setConsumer(
				async (launchParams: any) => {
					if (!launchParams.files.length) return

					for (const fileHandle of launchParams.files) {
						await this.importFile(fileHandle)
					}
				}
			)
		}
	}

	protected async onDrop(dataTransferItems: DataTransferItem[]) {
		for (const item of dataTransferItems) {
			const fileHandle = await item.getAsFileSystemHandle()
			if (!fileHandle) return

			if (fileHandle.kind === 'directory') {
				// TODO: Handle folder import
				this.state.failedImports.push(fileHandle.name)
			} else if (fileHandle.kind === 'file') {
				const importSucceeded = await this.importFile(fileHandle)

				if (!importSucceeded)
					this.state.failedImports.push(fileHandle.name)
			}
		}

		this.closeTimeout = window.setTimeout(
			() => {
				this.state.isHovering = false
			},
			this.state.failedImports.length > 0 ? 2500 : 0
		)
	}

	protected async importFile(fileHandle: FileSystemFileHandle) {
		const ext = extname(fileHandle.name)
		const handler = this.fileHandlers.get(ext)

		if (!handler) {
			this.state.failedImports.push(fileHandle.name)
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

	addFileImporter(
		ext: string,
		importHandler: (
			fileHandle: FileSystemFileHandle
		) => Promise<void> | void
	) {
		if (this.fileHandlers.has(ext))
			throw new Error(`Handler for ${ext} already exists`)

		this.fileHandlers.set(ext, importHandler)

		return {
			dispose: () => this.fileHandlers.delete(ext),
		}
	}
}
