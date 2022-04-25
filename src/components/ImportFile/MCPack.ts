import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImporter } from './Importer'
import { App } from '/@/App'
import { AnyFileHandle } from '../FileSystem/Types'
import { importFromMcpack } from '../Projects/Import/fromMcpack'

export class MCPackImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super(['.mcpack'], fileDropper)
	}

	async onImport(fileHandle: AnyFileHandle) {
		const app = await App.getApp()

		app.windows.loadingWindow.open()

		try {
			await importFromMcpack(fileHandle)
		} catch (err) {
			console.error(err)
		} finally {
			app.windows.loadingWindow.close()
		}
	}
}
