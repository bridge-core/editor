import { CreateProjectConfig } from '../../../CreateProjectConfig'
import { ConfigurableFile } from './../ConfigurableFile'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'

export class SoundsFile extends ConfigurableFile {
	public readonly id: string = 'sounds'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig
	) {}
}
