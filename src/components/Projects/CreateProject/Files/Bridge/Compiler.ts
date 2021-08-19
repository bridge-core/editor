import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateCompilerConfig extends CreateFile {
	public readonly id = 'compilerConfig'
	public isConfigurable = false

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.mkdir('.bridge/compiler')
		// Default compiler config moved to project config
	}
}
