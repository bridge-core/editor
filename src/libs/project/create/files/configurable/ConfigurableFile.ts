import { CreateProjectConfig } from '../../../CreateProjectConfig'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'

export class ConfigurableFile {
	public readonly id: string = 'none'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {}
}
