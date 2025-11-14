import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'

export abstract class DirectoryImporter {
	public abstract icon: string
	public abstract name: string
	public abstract description: string

	public abstract onImport(directory: BaseEntry, basePath: string): Promise<void> | void
}
