import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateConfig extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeJSON(
			`.bridge/config.json`,
			{
				prefix: createOptions.prefix,
				author: createOptions.author,
				targetVersion: createOptions.targetVersion,
				description: createOptions.description,
				gameTestAPI: createOptions.gameTest,
				scriptingAPI: createOptions.scripting,
			},
			true
		)
	}
}
