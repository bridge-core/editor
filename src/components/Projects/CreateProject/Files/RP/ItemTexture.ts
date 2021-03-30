import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateItemTexture extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.mkdir('RP/textures', { recursive: true })

		await fs.writeJSON(
			`RP/textures/item_texture.json`,
			{
				resource_pack_name: createOptions.name,
				texture_name: 'atlas.items',
				texture_data: {},
			},
			true
		)
	}
}
