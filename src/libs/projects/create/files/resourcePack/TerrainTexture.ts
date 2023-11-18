import { CreateProjectConfig } from '../../../CreateProjectConfig'
import { ConfigurableFile } from './../ConfigurableFile'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'

export class TerrainTextureFile extends ConfigurableFile {
	public readonly id: string = 'terrainTexture'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig
	) {}
}
