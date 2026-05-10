import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { CreateProjectConfig } from '../../CreateProjectConfig'
import { defaultPackPaths } from 'mc-project-core'

export async function createConfig(fileSystem: BaseFileSystem, path: string, config: CreateProjectConfig) {
	const configOutput = {
		type: 'minecraftBedrock',
		name: config.name,
		authors: [config.author],
		targetVersion: config.targetVersion,
		experimentalGameplay: config.experiments,
		namespace: config.namespace,
		packs: Object.fromEntries(config.packs.map((packId) => [packId, defaultPackPaths[packId as keyof typeof defaultPackPaths]])),
		worlds: ['./worlds/*'],
		packDefinitions: {},
		compiler: {
			plugins: [
				'generatorScripts',
				'typeScript',
				'entityIdentifierAlias',
				'customEntityComponents',
				'customItemComponents',
				'customBlockComponents',
				'customCommands',
				'moLang',
				'formatVersionCorrection',
				'floatPropertyTruncationFix',
				[
					'simpleRewrite',
					{
						packName: config.name,
					},
				],
			],
		},
	}

	await fileSystem.writeFile(path, JSON.stringify(configOutput, null, 2))
}
