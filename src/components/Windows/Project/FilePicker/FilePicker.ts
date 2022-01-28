import { App } from '/@/App'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
import FilePickerComponent from './FilePicker.vue'
import { relative } from '/@/utils/path'
import { QuickScore } from 'quick-score'
import { markRaw } from '@vue/composition-api'

export class FilePickerWindow extends BaseWindow {
	protected packFiles: { value: string; text: string }[] = []
	protected selectedFile = ''
	protected isCurrentlyOpening = false
	protected processedFiles: { value: string; text: string }[] = []
	protected quickScore = markRaw(new QuickScore(this.packFiles))

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
			await packIndexer.fired

			this.packFiles = (
				(await packIndexer.service?.getAllFiles(true)) ?? []
			).map((filePath) => ({
				text: relative(`projects/${app.project.name}`, filePath),
				value: filePath,
			}))
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
