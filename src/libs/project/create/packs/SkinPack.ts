import { join } from '@/libs/path'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { createManifest } from '../files/Manifest'
import { createIcon } from '../files/Icon'
import { CreateProjectConfig } from '../../CreateProjectConfig'
import { Pack } from './Pack'
import { SkinsFile } from '../files/configurable/skinPack/Skins'
import { createLang } from '../files/Lang'

export class SkinPack extends Pack {
	async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		pathPack: string
	) {
		await fileSystem.makeDirectory(pathPack)

		await createManifest(
			fileSystem,
			join(projectPath, 'SP/manifest.json'),
			config,
			'skinPack'
		)

		await createIcon(
			fileSystem,
			join(projectPath, 'SP/pack_icon.png'),
			config.icon
		)

		await createLang(fileSystem, pathPack, config)

		for (const file of this.configurableFiles) {
			if (!config.configurableFiles.includes(file.id)) continue

			await file.create(fileSystem, projectPath, config, pathPack)
		}
	}

	public readonly configurableFiles = [new SkinsFile()]
}
