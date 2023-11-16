import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'

export function createIcon(
	fileSystem: BaseFileSystem,
	path: string,
	icon: FileSystemWriteChunkType
) {
	fileSystem.writeFile(path, icon)
}
