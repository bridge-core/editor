import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImporter } from './Importer'
import { App } from '/@/App'

export class TextFileImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super(
			['.mcfunction', '.json', '.molang', '.js', '.ts', '.lang'],
			fileDropper
		)
	}

	async onImport(fileHandle: FileSystemFileHandle) {
		const app = await App.getApp()
		await app.project.openFile(fileHandle)
	}
}
