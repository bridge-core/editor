import { join } from '/@/libs/path'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { createManifest } from '../files/Manifest'
import { createIcon } from '../files/Icon'
import { CreateProjectConfig } from '../../CreateProjectConfig'

export async function createBehaviourPack(
	fileSystem: BaseFileSystem,
	projectPath: string,
	config: CreateProjectConfig
) {
	await fileSystem.makeDirectory(join(projectPath, 'BP'))

	await createManifest(fileSystem, join(projectPath, 'BP/manifest.json'))
	await createIcon(
		fileSystem,
		join(projectPath, 'BP/pack_icon.png'),
		config.icon
	)
}
