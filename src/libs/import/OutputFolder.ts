import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'
import { DirectoryImporter } from './DirectoryImporter'
import { Settings } from '@/libs/settings/Settings'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'

export class OutputFolderImporter extends DirectoryImporter {
	public icon: string = 'deployed_code'
	public name: string = 'fileDropper.importMethod.folder.output.name'
	public description: string = 'fileDropper.importMethod.folder.output.description'

	public async onImport(directory: BaseEntry, basePath: string) {
		const fileSystem = await directory.getFileSystem()

		if (!fileSystem) return
		if (!(fileSystem instanceof PWAFileSystem)) return

		await Settings.set('outputFolder', fileSystem.baseHandle)
	}
}
