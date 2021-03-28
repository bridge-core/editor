import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImporter } from './Importer'
import { App } from '/@/App'
import { Unzipper } from '../FileSystem/Unzipper'

export class MCAddonImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super('.mcaddon', fileDropper)
	}

	async onImport(file: File) {
		const app = await App.getApp()

		// const unzipper = new Unzipper()
	}
}
