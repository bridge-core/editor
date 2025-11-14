import { fileSystem, selectOrLoadBridgeFolder } from '@/libs/fileSystem/FileSystem'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { streamingUnzip } from '@/libs/zip/StreamingUnzipper'
import { basename, join } from 'pathe'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { FileImporter } from './FileImporter'
import { DirectoryImporter } from './DirectoryImporter'
import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'

export async function importFromBrProject(entry: BaseEntry) {
	if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) await selectOrLoadBridgeFolder()

	console.time('[Import] .brproject')

	const buffer = new Uint8Array(await entry.read())

	const targetPath = join('/projects', name)
	const projectPath = await fileSystem.findSuitableFolderName(targetPath)
	const projectName = basename(projectPath)

	await streamingUnzip(buffer, async (file) => {
		const path = join(projectPath, file.name)

		await fileSystem.ensureDirectory(path)

		await fileSystem.writeFileStreaming(path, file)
	})

	await ProjectManager.closeProject()
	await ProjectManager.loadProjects()
	await ProjectManager.loadProject(projectName)

	console.timeEnd('[Import] .brproject')
}

export class BrProjectFileImporter extends FileImporter {
	public constructor() {
		super(['.brproject'])
	}

	public async onImport(entry: BaseEntry, basePath: string) {
		await importFromBrProject(entry)
	}
}

export class BrProjectDirectoryImporter extends DirectoryImporter {
	public icon: string = 'folder_open'
	public name: string = 'fileDropper.importMethod.folder.project.name'
	public description: string = 'fileDropper.importMethod.folder.project.description'

	public async onImport(directory: BaseEntry, basePath: string) {
		const targetPath = join('/projects', basename(directory.path))
		const projectPath = await fileSystem.findSuitableFolderName(targetPath)
		const projectName = basename(projectPath)

		await fileSystem.copyDirectoryFromFileSystem('/', await directory.getFileSystem(), projectPath)

		await ProjectManager.closeProject()
		await ProjectManager.loadProjects()
		await ProjectManager.loadProject(projectName)
	}
}
