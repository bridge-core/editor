import { App } from '@/App'
import { selectedProject } from '@/components/Project/Loader'
import { BaseWindow } from '@/components/Windows/BaseWindow'
import FilePickerComponent from './FilePicker.vue'

export class FilePickerWindow extends BaseWindow {
	protected packFiles: string[] = []
	protected selectedFile = ''
	protected isCurrentlyOpening = false

	constructor() {
		super(FilePickerComponent, false, true)
		this.defineWindow()
	}

	open() {
		if (this.isCurrentlyOpening) return

		this.isCurrentlyOpening = true
		this.selectedFile = ''

		App.ready.once(async app => {
			app.windows.loadingWindow.open()

			await new Promise<void>(async resolve => {
				app.packIndexer.once(async () => {
					this.packFiles = []
					this.packFiles.push(
						...(await app.packIndexer.service.getAllFiles())
					)

					resolve()
				})
			})

			app.windows.loadingWindow.close()
			super.open()
			this.isCurrentlyOpening = false
		})
	}

	openFile(filePath: string) {
		App.ready.once(app =>
			app.tabSystem.open(`projects/${selectedProject}/${filePath}`)
		)
		this.close()
	}
}
