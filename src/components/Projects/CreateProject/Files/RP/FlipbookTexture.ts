import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateFlipbookTexture extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.mkdir('RP/textures', { recursive: true })

		await fs.writeJSON(`RP/textures/flipbook_texture.json`, [], true)
	}
}
