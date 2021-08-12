import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImporter } from './Importer'
import { App } from '/@/App'
import { Unzipper } from '../FileSystem/Zip/Unzipper'
import { AnyFileHandle } from '../FileSystem/Types'

export class MCAddonImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super(['.mcaddon'], fileDropper)
	}

	async onImport(fileHandle: AnyFileHandle) {
		const app = await App.getApp()

		// const unzipper = new Unzipper()
	}
}
