import { fileSystem, selectOrLoadBridgeFolder } from '@/libs/fileSystem/FileSystem'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { streamingUnzip } from '@/libs/zip/StreamingUnzipper'
import { basename, join } from 'pathe'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { FileImporter } from './FileImporter'
import { DirectoryImporter } from './DirectoryImporter'

export async function importFromBrProject(arrayBuffer: ArrayBuffer, name: string) {
	if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) await selectOrLoadBridgeFolder()

	console.time('[IMPORT] .brproject')

	const buffer = new Uint8Array(arrayBuffer)

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

	console.timeEnd('[IMPORT] .brproject')
}

export class BrProjectFileImporter extends FileImporter {
	public constructor() {
		super(['.brproject'])
	}

	public async onImport(fileHandle: FileSystemFileHandle, basePath: string) {
		await importFromBrProject(
			await (await fileHandle.getFile()).arrayBuffer(),
			basename(fileHandle.name, '.brproject')
		)
	}
}

export class BrProjectDirectoryImporter extends DirectoryImporter {
	public icon: string = 'folder_open'
	public name: string = 'fileDropper.importMethod.folder.project.name'
	public description: string = 'fileDropper.importMethod.folder.project.description'

	public async onImport(directoryHandle: FileSystemDirectoryHandle, basePath: string) {
		const targetPath = join('/projects', directoryHandle.name)
		const projectPath = await fileSystem.findSuitableFolderName(targetPath)
		const projectName = basename(projectPath)

		await fileSystem.copyDirectoryHandle(projectPath, directoryHandle)

		await ProjectManager.closeProject()
		await ProjectManager.loadProjects()
		await ProjectManager.loadProject(projectName)
	}
}
