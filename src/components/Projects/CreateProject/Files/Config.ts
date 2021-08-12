import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from './CreateFile'
import { PackType } from '/@/components/Data/PackType'

export class CreateConfig extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeJSON(
			`config.json`,
			{
				type: 'minecraftBedrock',
				name: createOptions.name,
				namespace: createOptions.namespace,
				author: createOptions.author,
				targetVersion: createOptions.targetVersion,
				description: createOptions.description,
				experimentalGameplay: createOptions.experimentalGameplay,
				packs: Object.fromEntries(
					createOptions.packs
						.filter((packId) => packId !== '.bridge')
						.map((packId) => [
							packId,
							`./${PackType.getFromId(packId)?.packPath}`,
						])
				),
				compiler: {
					plugins: [
						'typeScript',
						'entityIdentifierAlias',
						'customEntityComponents',
						'customItemComponents',
						'customBlockComponents',
						'customCommands',
						'moLang',
						['simpleRewrite', { packName: createOptions.name }],
					],
				},
			},
			true
		)
	}
}
