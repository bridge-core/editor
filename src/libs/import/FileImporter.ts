import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'

export abstract class FileImporter {
	constructor(public extensions: string[]) {}

	public abstract onImport(entry: BaseEntry, basePath: string): Promise<void> | void
}
