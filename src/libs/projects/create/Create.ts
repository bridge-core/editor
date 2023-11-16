import { createBehaviourPack } from './packs/BehaviourPack'
import { createBridgePack } from './packs/Bridge'
import { createResourcePack } from './packs/ResourcePack'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { join } from '/@/libs/path'

export interface CreateProjectConfig {
	name: string
	description: string
	namespace: string
	author: string
	targetVersion: string
	icon: FileSystemWriteChunkType
	packs: any[]
}

export async function createProject(
	config: CreateProjectConfig,
	fileSystem: BaseFileSystem
) {
	const projectPath = join('projects', config.name)

	await fileSystem.makeDirectory(projectPath)

	await createBridgePack(fileSystem, projectPath)

	if (config.packs.find((pack: any) => pack.id === 'behaviorPack'))
		await createBehaviourPack(fileSystem, projectPath, config.icon)

	if (config.packs.find((pack: any) => pack.id === 'resourcePack'))
		await createResourcePack(fileSystem, projectPath, config.icon)
}
