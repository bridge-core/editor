import { MCAddonImporter } from './MCAddon'
import { BasicFileImporter } from './BasicFile'
import type { FileDropper } from '/@/components/FileDropper/FileDropper'
import { BrprojectImporter } from './Brproject'
import { BBModelImporter } from '/@/components/ImportFile/BBModel'

export class FileImportManager {
	constructor(fileDropper: FileDropper) {
		new MCAddonImporter(fileDropper)
		new BasicFileImporter(fileDropper)
		new BrprojectImporter(fileDropper)
		new BBModelImporter(fileDropper)
	}
}
