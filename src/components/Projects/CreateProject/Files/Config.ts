import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from './CreateFile'
import { PackType } from '/@/components/Data/PackType'

export class CreateConfig extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		const capabilities: string[] = []
		if (createOptions.gameTest) capabilities.push('gameTestAPI')
		if (createOptions.scripting) capabilities.push('scriptingAPI')

		await fs.writeJSON(
			`config.json`,
			{
				type: 'minecraftBedrock',
				name: createOptions.name,
				namespace: createOptions.namespace,
				author: createOptions.author,
				targetVersion: createOptions.targetVersion,
				description: createOptions.description,
				capabilities,
				packs: Object.fromEntries(
					createOptions.packs
						.filter((packId) => packId !== '.bridge')
						.map((packId) => [packId, PackType.getFromId(packId)])
				),
			},
			true
		)
	}
}
