import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '/@/components/Projects/CreateProject/Files/File'

export class CreateConfig extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeJSON(
			`bridge/config.json`,
			{
				prefix: createOptions.prefix,
				author: createOptions.author,
				targetVersion: createOptions.targetVersion,
				description: createOptions.description,
			},
			true
		)
	}
}
