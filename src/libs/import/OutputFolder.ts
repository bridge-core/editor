import { DirectoryImporter } from './DirectoryImporter'
import { Settings } from '@/libs/settings/Settings'

export class OutputFolderImporter extends DirectoryImporter {
	public async onImport(directoryHandle: FileSystemDirectoryHandle, basePath: string) {
		await Settings.set('outputFolder', directoryHandle)
	}
}
