export abstract class DirectoryImporter {
	public abstract onImport(directoryHandle: FileSystemDirectoryHandle, basePath: string): Promise<void> | void
}
