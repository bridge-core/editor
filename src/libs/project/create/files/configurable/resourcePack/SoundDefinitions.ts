import { CreateProjectConfig } from '../../../../CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { join } from 'pathe'

export class SoundDefinitionsFile extends ConfigurableFile {
	public readonly id: string = 'soundDefinitions'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {
		if (!(await fileSystem.exists(join(packPath, 'sounds'))))
			await fileSystem.makeDirectory(join(packPath, 'sounds'))

		await fileSystem.writeFileJson(
			join(packPath, 'sounds/sound_definitions.json'),
			{
				format_version: '1.14.0',
				sound_definitions: {},
			},
			true
		)
	}
}
