import { Data } from '@/libs/data/Data'
import { CreateProjectConfig } from '@/libs/project/CreateProjectConfig'
import { ConfigurableFile } from '../ConfigurableFile'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { join } from 'pathe'

export class PlayerFile extends ConfigurableFile {
	public readonly id: string = 'player'

	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {
		const defaultPlayer = await Data.get('packages/minecraftBedrock/vanilla/player.json')

		if (!(await fileSystem.exists(join(packPath, 'entities'))))
			await fileSystem.makeDirectory(join(packPath, 'entities'))

		await fileSystem.writeFileJson(join(packPath, 'entities/player.json'), defaultPlayer, true)

		if (!(await fileSystem.exists(join(packPath, 'loot_tables'))))
			await fileSystem.makeDirectory(join(packPath, 'loot_tables'))

		await fileSystem.writeFile(join(packPath, 'loot_tables/empty.json'), '{}')
	}
}
