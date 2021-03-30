import { MCAddonImporter } from './MCAddon'
import { TextFileImporter } from './TextFile'
import type { FileDropper } from '/@/components/FileDropper/FileDropper'

export class FileImportManager {
	constructor(fileDropper: FileDropper) {
		// new MCAddonImporter(fileDropper)
		new TextFileImporter(fileDropper)
	}
}
