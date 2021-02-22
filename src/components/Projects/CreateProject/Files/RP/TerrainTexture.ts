import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '/@/components/Projects/CreateProject/Files/File'

export class CreateTerrainTexture extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.mkdir('RP/textures', { recursive: true })

		await fs.writeJSON(
			`RP/textures/terrain_texture.json`,
			{
				num_mip_levels: 4,
				padding: 8,
				resource_pack_name: createOptions.name,
				texture_name: 'atlas.terrain',
				texture_data: {},
			},
			true
		)
	}
}
