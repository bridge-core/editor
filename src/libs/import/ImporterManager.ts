import { extname } from 'pathe'
import { FileImporter } from './FileImporter'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { DirectoryImporter } from './DirectoryImporter'
import { Windows } from '@/components/Windows/Windows'
import { InformedChoiceWindow } from '@/components/Windows/InformedChoice/InformedChoiceWindow'

export class ImporterManager {
	protected static fileImporters: Record<string, FileImporter[]> = {}
	protected static defaultFileImporters: FileImporter[] = []

	protected static directoryImporters: DirectoryImporter[] = []

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

	public static addDirectoryImporter(importer: DirectoryImporter) {
		this.directoryImporters.push(importer)
	}

	public static removeDirectoryImporter(importer: DirectoryImporter) {
		this.directoryImporters.splice(this.directoryImporters.indexOf(importer), 1)
	}

	public static async importFile(fileHandle: FileSystemFileHandle, basePath?: string) {
		if (!basePath) {
			if (ProjectManager.currentProject) {
				basePath = ProjectManager.currentProject.path
			} else {
				basePath = '/'
			}
		}

		const extension = extname(fileHandle.name)

		if (this.fileImporters[extension] && this.fileImporters[extension].length > 0) {
			await this.fileImporters[extension][0].onImport(fileHandle, basePath)
		} else if (this.defaultFileImporters.length > 0) {
			await this.defaultFileImporters[0].onImport(fileHandle, basePath)
		} else {
			throw new Error('Could not import file. No importers added!')
		}
	}

	public static async importDirectory(directoryHandle: FileSystemDirectoryHandle, basePath?: string) {
		if (!basePath) {
			if (ProjectManager.currentProject) {
				basePath = ProjectManager.currentProject.path
			} else {
				basePath = '/'
			}
		}

		if (this.directoryImporters.length > 0) {
			Windows.open(
				new InformedChoiceWindow(
					'fileDropper.importMethod.name',
					this.directoryImporters.map((importer) => ({
						icon: importer.icon,
						name: importer.name,
						description: importer.description,
						choose: () => {
							importer.onImport(directoryHandle, basePath)
						},
					}))
				)
			)
		} else {
			throw new Error('Could not import directory. No importers added!')
		}
	}
}
