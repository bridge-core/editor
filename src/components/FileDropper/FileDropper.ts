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
		(file: File) => Promise<void> | void
	>()
	protected closeTimeout?: number

	constructor() {
		window.addEventListener('dragover', (event) => {
			event.preventDefault()

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

		window.addEventListener('drop', (event) => {
			event.preventDefault()

			this.onDrop([...(event.dataTransfer?.files ?? [])])
		})
	}

	protected async onDrop(files: File[]) {
		for (const file of files) {
			const ext = extname(file.name)
			console.log(ext)
			const handler = this.fileHandlers.get(ext)

			if (!handler) {
				this.state.failedImports.push(file.name)
				continue
			}

			try {
				await handler(file)
			} catch (err) {
				this.state.failedImports.push(file.name)
				console.error(err)
			}
		}

		this.closeTimeout = window.setTimeout(
			() => {
				this.state.isHovering = false
			},
			this.state.failedImports.length > 0 ? 2500 : 0
		)
	}

	addImporter(
		ext: string,
		importHandler: (file: File) => Promise<void> | void
	) {
		if (this.fileHandlers.has(ext))
			throw new Error(`Handler for ${ext} already exists`)

		this.fileHandlers.set(ext, importHandler)

		return {
			dispose: () => this.fileHandlers.delete(ext),
		}
	}
}
