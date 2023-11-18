import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { CreateProjectConfig } from '../../CreateProjectConfig'

export async function createConfig(
	fileSystem: BaseFileSystem,
	path: string,
	config: CreateProjectConfig
) {
	const configOutput = {
		type: 'minecraftBedrock',
		name: config.name,
		authors: [config.author],
		targetVersion: config.targetVersion,
		experimentalGameplay: {},
		namespace: config.namespace,
		packs: config.packs,
		worlds: [],
		packDefinitions: {},
		bridge: {},
	}

	await fileSystem.writeFile(path, JSON.stringify(configOutput, null, 2))
}
