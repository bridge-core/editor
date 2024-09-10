export abstract class FileImporter {
	constructor(public extensions: string[]) {}

	public abstract onImport(fileHandle: FileSystemFileHandle, basePath: string): Promise<void> | void
}
