import pathBrowserify from 'path-browserify'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'

export async function createBridgePack(
	fileSystem: BaseFileSystem,
	projectPath: string
) {
	await fileSystem.makeDirectory(pathBrowserify.join(projectPath, '.bridge'))
}
