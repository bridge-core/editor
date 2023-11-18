import { CreateProjectConfig } from '../../../../CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { join } from '/@/libs/path'

export class TickFile extends ConfigurableFile {
	public readonly id: string = 'tick'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig
	) {
		if (!(await fileSystem.exists(join(projectPath, 'BP/functions'))))
			await fileSystem.makeDirectory(join(projectPath, 'BP/functions'))

		await fileSystem.writeFileJson(
			join(projectPath, 'BP/functions/tick.json'),
			{ values: [] },
			true
		)
	}
}
