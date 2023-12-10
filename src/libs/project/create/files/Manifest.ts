import { v4 as uuid } from 'uuid'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { CreateProjectConfig } from '../../CreateProjectConfig'
import { appVersion, dashVersion } from '@/libs/app/AppEnv'
import { data } from '@/App'

async function targetVersionToMinEngineVersion(targetVersion: string) {
	const mineEngineVersions: Record<string, string> = await data.get(
		'packages/minecraftBedrock/minEngineVersionMap.json'
	)

	return mineEngineVersions[targetVersion] ?? targetVersion
}

function packTypeToModuleType(packType: string) {
	switch (packType) {
		case 'behaviorPack':
			return 'data'
		case 'resourcePack':
			return 'resources'
		case 'skinPack':
			return 'skin_pack'
		default:
			throw new Error('Invalid pack type ' + packType)
	}
}

export async function createManifest(
	fileSystem: BaseFileSystem,
	path: string,
	config: CreateProjectConfig,
	packType: string
) {
	const manifest: { [key: string]: any } = {
		format_version: 2,
		metadata: {
			authors: [config.author],
			generated_with: {
				bridge: [appVersion],
				dash: [dashVersion],
			},
		},
		header: {
			name: 'pack.name',
			description: 'pack.description',
			min_engine_version:
				packType === 'behaviorPack' || packType === 'resourcePack'
					? (
							await targetVersionToMinEngineVersion(
								config.targetVersion
							)
					  )
							.split('.')
							.map((str) => Number(str))
					: undefined,
			uuid: config.uuids[packType],
			version: [1, 0, 0],
		},
		modules: [
			{
				type: packTypeToModuleType(packType),
				uuid: uuid(),
				version: [1, 0, 0],
			},
		],
	}

	if (config.rpAsBpDependency && packType === 'behaviorPack') {
		manifest.dependencies = [
			{
				uuid: config.uuids.resourcePack,
				version: [1, 0, 0],
			},
		]
	}

	if (config.bpAsRpDependency && packType === 'resourcePack') {
		manifest.dependencies = [
			{
				uuid: config.uuids.behaviorPack,
				version: [1, 0, 0],
			},
		]
	}

	await fileSystem.writeFile(path, JSON.stringify(manifest, null, 2))
}
