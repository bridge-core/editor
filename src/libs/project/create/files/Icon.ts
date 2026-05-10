import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'

export async function createIcon(
	fileSystem: BaseFileSystem,
	path: string,
	icon: FileSystemWriteChunkType
) {
	await fileSystem.writeFile(path, icon)
}
