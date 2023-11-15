import pathBrowserify from 'path-browserify'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { createManifest } from '../Files/Manifest'

export async function createBehaviourPack(
	fileSystem: BaseFileSystem,
	projectPath: string
) {
	await fileSystem.makeDirectory(pathBrowserify.join(projectPath, 'BP'))

	await createManifest(
		fileSystem,
		pathBrowserify.join(projectPath, 'BP/manifest.json')
	)
}
