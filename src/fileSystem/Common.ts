export interface IMkdirConfig {
	recursive: boolean
}

export interface IGetHandleConfig {
	create: boolean
	createOnce: boolean
}

export interface IFileSystem {
	mkdir(path: string[], { recursive }: Partial<IMkdirConfig>): Promise<void>

	readdir(
		path: string[],
		{ withFileTypes }: { withFileTypes: true }
	): Promise<FileSystemHandle[]>
	readdir(
		path: string[],
		{ withFileTypes }: { withFileTypes?: false }
	): Promise<string[]>

	readFile(path: string[]): Promise<File>

	unlink(path: string[]): Promise<void>

	writeFile(path: string[], data: FileSystemWriteChunkType): Promise<void>
}
