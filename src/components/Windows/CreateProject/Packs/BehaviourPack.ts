import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { createManifest } from '../Files/Manifest'
import { join } from '/@/libs/path'

export async function createBehaviourPack(
	fileSystem: BaseFileSystem,
	projectPath: string
) {
	await fileSystem.makeDirectory(join(projectPath, 'BP'))

	await createManifest(fileSystem, join(projectPath, 'BP/manifest.json'))
}
