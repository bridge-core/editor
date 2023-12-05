import { CreateProjectConfig } from '../../../../CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { join } from '@/libs/path'

export class SoundsFile extends ConfigurableFile {
	public readonly id: string = 'sounds'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {
		await fileSystem.writeFileJson(join(packPath, 'sounds.json'), {}, true)
	}
}
