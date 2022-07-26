import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from './CreateFile'
import { TPackTypeId } from '/@/components/Data/PackType'
import { defaultPackPaths } from '../../Project/Config'

export class CreateConfig extends CreateFile {
	public readonly id = 'bridgeConfig'

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeJSON(
			`config.json`,
			{
				type: 'minecraftBedrock',
				name: createOptions.name,
				namespace: createOptions.namespace,
				authors: Array.isArray(createOptions.author)
					? createOptions.author
					: [createOptions.author],
				targetVersion: createOptions.targetVersion,
				description: createOptions.description,
				experimentalGameplay: createOptions.experimentalGameplay,
				bdsProject: createOptions.bdsProject,
				packs: Object.fromEntries(
					createOptions.packs
						.filter((packId) => packId !== '.bridge')
						.map((packId) => [
							packId,
							defaultPackPaths[<TPackTypeId>packId],
						])
				),
				worlds: ['./worlds/*'],
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
						[
							'simpleRewrite',
							{
								packName: createOptions.name,
							},
						],
					],
				},
			},
			true
		)
	}
}
