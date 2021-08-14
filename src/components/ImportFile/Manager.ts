import { MCAddonImporter } from './MCAddon'
import { BasicFileImporter } from './BasicFile'
import type { FileDropper } from '/@/components/FileDropper/FileDropper'

export class FileImportManager {
	constructor(fileDropper: FileDropper) {
		new MCAddonImporter(fileDropper)
		new BasicFileImporter(fileDropper)
	}
}
