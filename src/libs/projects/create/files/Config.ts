import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { CreateProjectConfig } from '../../CreateProjectConfig'

export function createConfig(
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
		packs: config.packs.map((pack) => pack.id),
		worlds: [],
		packDefinitions: {},
		bridge: {},
	}

	fileSystem.writeFile(path, JSON.stringify(configOutput, null, 2))
}
