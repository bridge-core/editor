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
		App.audioManager.playAudio('click5.ogg', 1)
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
			const fileHandle = await app.fileSystem.getFileHandle(filePath)
			app.project?.openFile(fileHandle)
		})
		App.audioManager.playAudio('confirmation_002.ogg', 1)
		this.close()
	}
}
