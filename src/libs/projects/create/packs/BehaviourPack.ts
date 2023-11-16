import { join } from '/@/libs/path'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { createManifest } from '../files/Manifest'
import { createIcon } from '../files/Icon'

export async function createBehaviourPack(
	fileSystem: BaseFileSystem,
	projectPath: string,
	icon: FileSystemWriteChunkType
) {
	await fileSystem.makeDirectory(join(projectPath, 'BP'))

	await createManifest(fileSystem, join(projectPath, 'BP/manifest.json'))
	await createIcon(fileSystem, join(projectPath, 'BP/pack_icon.png'), icon)
}
