import { FileSystem } from '@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '@/components/Project/CreateProject/CreateProject'
import { CreateFile } from '@/components/Project/CreateProject/Files/File'

export class CreateConfig extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeJSON(
			`bridge/config.json`,
			{
				projectPrefix: createOptions.prefix,
				projectAuthor: createOptions.author,
				projectTargetVersion: createOptions.targetVersion,
			},
			true
		)
	}
}
