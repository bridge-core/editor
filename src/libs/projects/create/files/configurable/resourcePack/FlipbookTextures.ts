import { CreateProjectConfig } from '../../../../CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { join } from '/@/libs/path'

export class FlipbookTexturesFile extends ConfigurableFile {
	public readonly id: string = 'flipbookTextures'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig
	) {
		if (
			!(await fileSystem.exists(
				join(projectPath, 'RP/textures/textures')
			))
		)
			await fileSystem.makeDirectory(
				join(projectPath, 'RP/textures/textures')
			)

		await fileSystem.writeFileJson(
			join(projectPath, 'RP/textures/flipbook_textures.json'),
			[],
			true
		)
	}
}
