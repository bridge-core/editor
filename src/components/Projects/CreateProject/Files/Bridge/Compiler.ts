import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '/@/components/Projects/CreateProject/Files/File'

export class CreateCompilerConfig extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.mkdir('bridge/compiler')
		await fs.writeJSON(
			`bridge/compiler/default.json`,
			{
				icon: 'mdi-cogs',
				name: 'Default Script',
				description:
					'Transforms the "bridge." folder structure to "com.mojang". "bridge." runs it automatically in dev mode in the background to enable fast, incremental builds for testing.',
				plugins: [
					'typeScript',
					'entityIdentifierAlias',
					'customEntityComponents',
					'customItemComponents',
					'customBlockComponents',
					['comMojangRewrite', { packName: createOptions.name }],
				],
			},
			true
		)
	}
}
