import { join } from '/@/libs/path'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'

export async function createBridgePack(
	fileSystem: BaseFileSystem,
	projectPath: string
) {
	await fileSystem.makeDirectory(join(projectPath, '.bridge'))
}
