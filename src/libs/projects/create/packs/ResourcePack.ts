import { join } from '/@/libs/path'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { createManifest } from '../files/Manifest'
import { createIcon } from '../files/Icon'
import { CreateProjectConfig } from '../../CreateProjectConfig'
import { Pack } from './Pack'
import { BiomesClientFile } from '../files/resourcePack/BiomesClient'
import { BlocksFile } from '../files/resourcePack/Blocks'
import { FlipbookTexturesFile } from '../files/resourcePack/FlipbookTextures'
import { ItemTextureFile } from '../files/resourcePack/ItemTexture'
import { SoundDefinitionsFile } from '../files/resourcePack/soundDefinitions'
import { SoundsFile } from '../files/resourcePack/Sounds'
import { TerrainTextureFile } from '../files/resourcePack/TerrainTexture'

export class ResourcePack extends Pack {
	async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig
	) {
		await fileSystem.makeDirectory(join(projectPath, 'RP'))

		await createManifest(fileSystem, join(projectPath, 'RP/manifest.json'))
		await createIcon(
			fileSystem,
			join(projectPath, 'RP/pack_icon.png'),
			config.icon
		)

		for (const file of this.configurableFiles) {
			if (!config.configurableFiles.includes(file.id)) continue

			await file.create(fileSystem, projectPath, config)
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
