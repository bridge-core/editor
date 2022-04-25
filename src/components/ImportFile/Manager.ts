import { MCAddonImporter } from './MCAddon'
import { BasicFileImporter } from './BasicFile'
import type { FileDropper } from '/@/components/FileDropper/FileDropper'
import { BrprojectImporter } from './Brproject'
import { BBModelImporter } from '/@/components/ImportFile/BBModel'
import { ZipImporter } from './ZipImporter'
import { MCPackImporter } from './MCPack'

export class FileImportManager {
	constructor(fileDropper: FileDropper) {
		new MCAddonImporter(fileDropper)
		new BasicFileImporter(fileDropper)
		new BrprojectImporter(fileDropper)
		new BBModelImporter(fileDropper)
		new ZipImporter(fileDropper)
		new MCPackImporter(fileDropper)
	}
}
