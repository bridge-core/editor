import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateGameTestMain extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		if (createOptions.gameTest) {
			await fs.mkdir('BP/scripts', { recursive: true })
			await fs.writeFile('BP/scripts/main.js', '')
		}
	}
}
