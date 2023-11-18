import { CreateProjectConfig } from '../../../CreateProjectConfig'
import { ConfigurableFile } from './../ConfigurableFile'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'

export class ItemTextureFile extends ConfigurableFile {
	public readonly id: string = 'itemTexture'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig
	) {}
}
