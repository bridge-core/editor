import { CreateProjectConfig } from '../../../CreateProjectConfig'
import { ConfigurableFile } from './../ConfigurableFile'
import { App } from '/@/App'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { join } from '/@/libs/path'

export class PlayerFile extends ConfigurableFile {
	public readonly id: string = 'player'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig
	) {
		const defaultPlayer = await App.instance.data.get(
			'packages/minecraftBedrock/vanilla/player.json'
		)

		if (!(await fileSystem.exists(join(projectPath, 'BP/entities'))))
			await fileSystem.makeDirectory(join(projectPath, 'BP/entities'))

		await fileSystem.writeFileJson(
			join(projectPath, 'BP/entities/player.json'),
			defaultPlayer,
			true
		)

		if (!(await fileSystem.exists(join(projectPath, 'BP/loot_tables'))))
			await fileSystem.makeDirectory(join(projectPath, 'BP/loot_tables'))

		await fileSystem.writeFile(
			join(projectPath, 'BP/loot_tables/empty.json'),
			'{}'
		)
	}
}
