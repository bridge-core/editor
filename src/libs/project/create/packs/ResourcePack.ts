import { join } from '@/libs/path'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { createManifest } from '../files/Manifest'
import { createIcon } from '../files/Icon'
import { CreateProjectConfig } from '../../CreateProjectConfig'
import { Pack } from './Pack'
import { BiomesClientFile } from '../files/configurable/resourcePack/BiomesClient'
import { BlocksFile } from '../files/configurable/resourcePack/Blocks'
import { FlipbookTexturesFile } from '../files/configurable/resourcePack/FlipbookTextures'
import { ItemTextureFile } from '../files/configurable/resourcePack/ItemTexture'
import { SoundDefinitionsFile } from '../files/configurable/resourcePack/SoundDefinitions'
import { SoundsFile } from '../files/configurable/resourcePack/Sounds'
import { TerrainTextureFile } from '../files/configurable/resourcePack/TerrainTexture'
import { createLang } from '../files/Lang'

export class ResourcePack extends Pack {
	async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {
		await fileSystem.makeDirectory(packPath)

		await createManifest(
			fileSystem,
			join(projectPath, 'RP/manifest.json'),
			config,
			'resourcePack'
		)

		await createIcon(
			fileSystem,
			join(projectPath, 'RP/pack_icon.png'),
			config.icon
		)

		await createLang(fileSystem, packPath, config)

		for (const file of this.configurableFiles) {
			if (!config.configurableFiles.includes(file.id)) continue

			await file.create(fileSystem, projectPath, config, packPath)
		}
	}

	public readonly configurableFiles = [
		new BiomesClientFile(),
		new BlocksFile(),
		new FlipbookTexturesFile(),
		new ItemTextureFile(),
		new SoundDefinitionsFile(),
		new SoundsFile(),
		new TerrainTextureFile(),
	]
}
