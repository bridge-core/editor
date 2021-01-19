import { App } from '@/App'
import { selectedProject } from '@/components/Project/Loader'
import { mainTabSystem } from '@/components/TabSystem/Main'
import { BaseWindow } from '@/components/Windows/BaseWindow'
import FilePickerComponent from './FilePicker.vue'

export class FilePickerWindow extends BaseWindow {
	protected packFiles: string[] = []
	protected selectedFile = ''

	constructor() {
		super(FilePickerComponent, false, true)
		this.defineWindow()
	}

	open() {
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
		})
	}

	openFile(filePath: string) {
		mainTabSystem.open(`projects/${selectedProject}/${filePath}`)
		this.close()
	}
}
