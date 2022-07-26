import { AnyFileHandle } from '../FileSystem/Types'
import type { FileDropper } from '/@/components/FileDropper/FileDropper'
import { IDisposable } from '/@/types/disposable'

export abstract class FileImporter {
	protected disposables: IDisposable[] = []

	constructor(
		extensions: string[],
		fileDropper: FileDropper,
		defaultImporter = false
	) {
		for (const extension of extensions) {
			this.disposables.push(
				fileDropper.addFileImporter(extension, this.onImport.bind(this))
			)
		}

		if (defaultImporter) {
			this.disposables.push(
				fileDropper.setDefaultFileImporter(this.onImport.bind(this))
			)
		}
	}

	protected abstract onImport(fileHandle: AnyFileHandle): Promise<void> | void

	dispose() {
		this.disposables.forEach((disposable) => disposable.dispose())
	}
}
