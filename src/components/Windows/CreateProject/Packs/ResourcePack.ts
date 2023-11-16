import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { createManifest } from '../Files/Manifest'
import { join } from '/@/libs/path'

export async function createResourcePack(
	fileSystem: BaseFileSystem,
	projectPath: string
) {
	await fileSystem.makeDirectory(join(projectPath, 'RP'))

	await createManifest(fileSystem, join(projectPath, 'RP/manifest.json'))
}
