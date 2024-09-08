import { join } from 'pathe'
import { FileImporter } from './file/FileImporter'
import { fileSystem } from '../fileSystem/FileSystem'
import { TabManager } from '@/components/TabSystem/TabManager'

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
		const targetPath = join(basePath, fileHandle.name)
		const suitablePath = await fileSystem.findSuitableFileName(targetPath)

		await fileSystem.writeFile(suitablePath, await (await fileHandle.getFile()).arrayBuffer())

		await TabManager.openFile(suitablePath)
	}
}
