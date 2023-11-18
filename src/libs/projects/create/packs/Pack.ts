import { CreateProjectConfig } from '../../CreateProjectConfig'
import { ConfigurableFile } from '../files/configurable/ConfigurableFile'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'

export class Pack {
	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig
	) {}

	public readonly configurableFiles: ConfigurableFile[] = []
}
