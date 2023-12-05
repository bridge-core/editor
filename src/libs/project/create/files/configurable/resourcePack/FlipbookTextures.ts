import { CreateProjectConfig } from '../../../../CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { join } from '@/libs/path'

export class FlipbookTexturesFile extends ConfigurableFile {
	public readonly id: string = 'flipbookTextures'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {
		if (!(await fileSystem.exists(join(packPath, 'textures'))))
			await fileSystem.makeDirectory(join(packPath, 'textures'))

		await fileSystem.writeFileJson(
			join(packPath, 'textures/flipbook_textures.json'),
			[],
			true
		)
	}
}
