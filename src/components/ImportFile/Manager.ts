import { MCAddonImporter } from './MCAddon'
import type { FileDropper } from '/@/components/FileDropper/FileDropper'

export class FileImportManager {
	constructor(fileDropper: FileDropper) {
		new MCAddonImporter(fileDropper)
	}
}
