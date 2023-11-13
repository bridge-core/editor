/* FileSystems operate withing a base directory. All paths are then relative to this base directory. */

export abstract class BaseFileSystem {
	public async writeFile(path: string, content: FileSystemWriteChunkType) {}
}
