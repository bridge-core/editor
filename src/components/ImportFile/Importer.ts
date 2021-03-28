import type { FileDropper } from '/@/components/FileDropper/FileDropper'
import { IDisposable } from '/@/types/disposable'

export abstract class FileImporter {
	protected disposable: IDisposable

	constructor(extension: string, fileDropper: FileDropper) {
		this.disposable = fileDropper.addImporter(
			extension,
			this.onImport.bind(this)
		)
	}

	protected abstract onImport(file: File): Promise<void> | void
}
