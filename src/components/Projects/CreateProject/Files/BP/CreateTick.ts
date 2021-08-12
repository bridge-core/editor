import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateTick extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeJSON(`BP/functions/tick.json`, { values: [] }, true)
	}
}
