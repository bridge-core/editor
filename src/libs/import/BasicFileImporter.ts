import { basename, join } from 'pathe'
import { FileImporter } from './FileImporter'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { TabManager } from '@/components/TabSystem/TabManager'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'

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

	public async onImport(entry: BaseEntry, basePath: string) {
		if (basePath === '/') return

		if (
			ProjectManager.currentProject &&
			ProjectManager.currentProject instanceof BedrockProject &&
			basePath === ProjectManager.currentProject.path
		) {
			basePath = (await ProjectManager.currentProject.fileTypeData.guessFolder(entry)) ?? basePath
		}

		const targetPath = join(basePath, basename(entry.path))

		await fileSystem.ensureDirectory(targetPath)

		const suitablePath = await fileSystem.findSuitableFileName(targetPath)

		await fileSystem.writeFile(suitablePath, await entry.read())

		await TabManager.openFile(suitablePath)
	}
}
