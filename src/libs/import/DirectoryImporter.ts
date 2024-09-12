export abstract class DirectoryImporter {
	public abstract icon: string
	public abstract name: string
	public abstract description: string

	public abstract onImport(directoryHandle: FileSystemDirectoryHandle, basePath: string): Promise<void> | void
}
