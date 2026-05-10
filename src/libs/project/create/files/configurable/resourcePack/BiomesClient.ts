import { CreateProjectConfig } from '../../../../CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { join } from 'pathe'

export class BiomesClientFile extends ConfigurableFile {
	public readonly id: string = 'biomesClient'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {
		await fileSystem.writeFileJson(
			join(packPath, `biomes_client.json`),
			{
				biomes: {},
			},
			true
		)
	}
}
