import { CreateProjectConfig } from '../../../../CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { join } from 'pathe'

export class ItemTextureFile extends ConfigurableFile {
	public readonly id: string = 'itemTexture'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {
		if (!(await fileSystem.exists(join(packPath, 'textures/textures'))))
			await fileSystem.makeDirectory(join(packPath, 'textures/textures'))

		await fileSystem.writeFileJson(
			join(packPath, 'textures/item_texture.json'),
			{
				resource_pack_name: config.name,
				texture_name: 'atlas.items',
				texture_data: {},
			},
			true
		)
	}
}
