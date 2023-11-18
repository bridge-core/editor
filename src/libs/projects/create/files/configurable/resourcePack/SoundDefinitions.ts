import { CreateProjectConfig } from '../../../../CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { join } from '/@/libs/path'

export class SoundDefinitionsFile extends ConfigurableFile {
	public readonly id: string = 'soundDefinitions'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig
	) {
		if (!(await fileSystem.exists(join(projectPath, 'RP/sounds'))))
			await fileSystem.makeDirectory(join(projectPath, 'RP/sounds'))

		await fileSystem.writeFileJson(
			join(projectPath, 'RP/sounds/sound_definitions.json'),
			{
				format_version: '1.14.0',
				sound_definitions: {},
			},
			true
		)
	}
}
