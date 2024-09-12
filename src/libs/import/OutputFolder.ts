import { DirectoryImporter } from './DirectoryImporter'
import { Settings } from '@/libs/settings/Settings'

export class OutputFolderImporter extends DirectoryImporter {
	public icon: string = 'deployed_code'
	public name: string = 'fileDropper.importMethod.folder.output.name'
	public description: string = 'fileDropper.importMethod.folder.output.description'

	public async onImport(directoryHandle: FileSystemDirectoryHandle, basePath: string) {
		await Settings.set('outputFolder', directoryHandle)
	}
}
