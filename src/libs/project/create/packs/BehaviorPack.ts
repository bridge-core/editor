import { join } from 'pathe'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { createManifest } from '../files/Manifest'
import { createIcon } from '../files/Icon'
import { CreateProjectConfig } from '../../CreateProjectConfig'
import { Pack } from './Pack'
import { PlayerFile } from '../files/configurable/behaviorPack/Player'
import { TickFile } from '../files/configurable/behaviorPack/Tick'
import { createLang } from '../files/Lang'

export class BehaviourPack extends Pack {
	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {
		await fileSystem.makeDirectory(packPath)

		await createManifest(fileSystem, join(projectPath, 'BP/manifest.json'), config, 'behaviorPack')
		await createIcon(fileSystem, join(projectPath, 'BP/pack_icon.png'), config.icon)

		await createLang(fileSystem, packPath, config)

		for (const file of this.configurableFiles) {
			if (!config.configurableFiles.includes(file.id)) continue

			await file.create(fileSystem, projectPath, config, packPath)
		}
	}

	public readonly configurableFiles = [new PlayerFile(), new TickFile()]
}
