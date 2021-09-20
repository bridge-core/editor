import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImporter } from './Importer'
import { AnyFileHandle } from '../FileSystem/Types'
import { importFromBrproject } from '../Projects/Import/fromBrproject'

export class BrprojectImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super(['.brproject'], fileDropper)
	}

	async onImport(fileHandle: AnyFileHandle) {
		await importFromBrproject(fileHandle)
	}
}
