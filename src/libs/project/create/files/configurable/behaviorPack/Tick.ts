import { CreateProjectConfig } from '../../../../CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { join } from 'pathe'

export class TickFile extends ConfigurableFile {
	public readonly id: string = 'tick'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {
		if (!(await fileSystem.exists(join(packPath, 'functions'))))
			await fileSystem.makeDirectory(join(packPath, 'functions'))

		await fileSystem.writeFileJson(join(packPath, 'functions/tick.json'), { values: [] }, true)
	}
}
