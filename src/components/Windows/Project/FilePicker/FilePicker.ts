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
		App.ready.once(app =>
			app.project?.openFile(`projects/${app.selectedProject}/${filePath}`)
		)
		this.close()
	}
}
