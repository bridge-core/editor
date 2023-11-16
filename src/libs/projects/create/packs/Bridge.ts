import { join } from '/@/libs/path'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { Pack } from './Pack'
import { CreateProjectConfig } from '../../CreateProjectConfig'

export class BridgePack extends Pack {
	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig
	) {
		await fileSystem.makeDirectory(join(projectPath, '.bridge'))
	}
}
