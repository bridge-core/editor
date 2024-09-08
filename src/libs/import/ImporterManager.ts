import { extname } from 'pathe'
import { FileImporter } from './file/FileImporter'
import { ProjectManager } from '@/libs/project/ProjectManager'

export class ImporterManager {
	protected static fileImporters: Record<string, FileImporter[]> = {}
	protected static defaultFileImporters: FileImporter[] = []

	public static addFileImporter(importer: FileImporter, defaultImporter: boolean = true) {
		for (const extension of importer.extensions) {
			const importers = this.fileImporters[extension] ?? []

			importers.unshift(importer)

			this.fileImporters[extension] = importers
		}

		if (defaultImporter) this.defaultFileImporters.unshift(importer)
	}

	public static removeFileImporter(importer: FileImporter) {
		if (!this.defaultFileImporters.includes(importer)) return

		for (const extension of importer.extensions) {
			if (!this.fileImporters[extension]) continue

			this.fileImporters[extension].splice(this.fileImporters[extension].indexOf(importer), 1)
		}

		this.defaultFileImporters.splice(this.defaultFileImporters.indexOf(importer), 1)
	}

	public static async importFile(fileHandle: FileSystemFileHandle, basePath?: string) {
		if (!basePath) {
			if (!ProjectManager.currentProject) return

			basePath = ProjectManager.currentProject.path
		}

		console.log('Importing', fileHandle)

		const extension = extname(fileHandle.name)

		if (this.fileImporters[extension] && this.fileImporters[extension].length > 0) {
			await this.fileImporters[extension][0].onImport(fileHandle, basePath)
		} else if (this.defaultFileImporters.length > 0) {
			await this.defaultFileImporters[0].onImport(fileHandle, basePath)
		} else {
			throw new Error('Could not import file. No importers added!')
		}
	}
}
