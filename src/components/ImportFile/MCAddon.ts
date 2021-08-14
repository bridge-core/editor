import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImporter } from './Importer'
import { App } from '/@/App'
import { AnyFileHandle } from '../FileSystem/Types'
import { importFromMcaddon } from '../Projects/Import/fromMcaddon'

export class MCAddonImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super(['.mcaddon'], fileDropper)
	}

	async onImport(fileHandle: AnyFileHandle) {
		const app = await App.getApp()

		app.windows.loadingWindow.open()

		try {
			await importFromMcaddon(fileHandle)
		} catch (err) {
			console.error(err)
		} finally {
			app.windows.loadingWindow.close()
		}
	}
}
