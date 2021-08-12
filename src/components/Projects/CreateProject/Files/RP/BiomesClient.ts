import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateBiomesClient extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeJSON(
			`RP/biomes_client.json`,
			{
				biomes: {},
			},
			true
		)
	}
}
