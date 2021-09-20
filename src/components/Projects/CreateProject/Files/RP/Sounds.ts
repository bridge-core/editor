import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateSounds extends CreateFile {
	public readonly id = 'sounds'

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeJSON(`RP/sounds.json`, {}, true)
	}
}
