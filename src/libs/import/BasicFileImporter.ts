import { join } from 'pathe'
import { FileImporter } from './FileImporter'
import { fileSystem } from '../fileSystem/FileSystem'
import { TabManager } from '@/components/TabSystem/TabManager'
import { ProjectManager } from '../project/ProjectManager'
import { BedrockProject } from '../project/BedrockProject'

export class BasicFileImporter extends FileImporter {
	public constructor() {
		super([
			'.mcfunction',
			'.mcstructure',
			'.json',
			'.molang',
			'.js',
			'.ts',
			'.lang',
			'.tga',
			'.png',
			'.jpg',
			'.jpeg',
			'.wav',
			'.ogg',
			'.mp3',
			'.fsb',
		])
	}

	public async onImport(fileHandle: FileSystemFileHandle, basePath: string) {
		if (basePath === '/') return

		if (
			ProjectManager.currentProject &&
			ProjectManager.currentProject instanceof BedrockProject &&
			basePath === ProjectManager.currentProject.path
		) {
			basePath = (await ProjectManager.currentProject.fileTypeData.guessFolder(fileHandle)) ?? basePath
		}

		const targetPath = join(basePath, fileHandle.name)

		await fileSystem.ensureDirectory(targetPath)

		const suitablePath = await fileSystem.findSuitableFileName(targetPath)

		await fileSystem.writeFile(suitablePath, await (await fileHandle.getFile()).arrayBuffer())

		await TabManager.openFile(suitablePath)
	}
}
