import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '/@/components/Projects/CreateProject/Files/File'

export class CreateGameTestMain extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		if (createOptions.gameTest) {
			await fs.mkdir('BP/scripts/gametests', { recursive: true })
			await fs.writeFile('BP/scripts/gametests/Main.js', '')
		}
	}
}
