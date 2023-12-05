import { CreateProjectConfig } from '../../../../CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { join } from '@/libs/path'

export class BlocksFile extends ConfigurableFile {
	public readonly id: string = 'blocks'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {
		await fileSystem.writeFileJson(
			join(packPath, `blocks.json`),
			{
				format_version: [1, 1, 0],
			},
			true
		)
	}
}
