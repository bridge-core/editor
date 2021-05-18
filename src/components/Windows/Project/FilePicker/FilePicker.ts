import { App } from '/@/App'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
import FilePickerComponent from './FilePicker.vue'

export class FilePickerWindow extends BaseWindow {
	protected packFiles: string[] = []
	protected selectedFile = ''
	protected isCurrentlyOpening = false

	constructor() {
		super(FilePickerComponent, false, true)
		this.defineWindow()
	}

	async open() {
		new Audio('/audio/click5.ogg').play()
		if (this.isCurrentlyOpening) return

		this.isCurrentlyOpening = true
		this.selectedFile = ''

		const app = await App.getApp()
		app.windows.loadingWindow.open()

		const packIndexer = app.project?.packIndexer
		if (packIndexer) {
			this.packFiles =
				(await packIndexer.service?.getAllFiles(true)) ?? []
		}

		app.windows.loadingWindow.close()
		super.open()
		this.isCurrentlyOpening = false
	}

	protected openFile(filePath: string) {
		App.ready.once(async (app) => {
			const fileHandle = await app.fileSystem.getFileHandle(
				`projects/${app.selectedProject}/${filePath}`
			)
			app.project?.openFile(fileHandle)
		})
		new Audio('/audio/confirmation_002.ogg').play()
		this.close()
	}
}
