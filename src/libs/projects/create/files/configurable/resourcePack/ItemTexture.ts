import { CreateProjectConfig } from '../../../../CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { join } from '/@/libs/path'

export class ItemTextureFile extends ConfigurableFile {
	public readonly id: string = 'itemTexture'

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
			join(projectPath, 'RP/textures/item_texture.json'),
			{
				resource_pack_name: config.name,
				texture_name: 'atlas.items',
				texture_data: {},
			},
			true
		)
	}
}
