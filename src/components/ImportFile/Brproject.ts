import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImporter } from './Importer'
import { AnyFileHandle } from '../FileSystem/Types'
import { importFromBrproject } from '../Projects/Import/fromBrproject'

export class BrprojectImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super(['.mcaddon'], fileDropper)
	}

	async onImport(fileHandle: AnyFileHandle) {
		const file = await fileHandle.getFile()

		await importFromBrproject(new Uint8Array(await file.arrayBuffer()))
	}
}
