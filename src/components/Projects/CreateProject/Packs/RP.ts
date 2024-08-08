import { CreatePack } from './Pack'
import { CreateManifest } from '../Files/Manifest'
import { CreateLang } from '../Files/Lang'
import { CreatePackIcon } from '../Files/PackIcon'
import { CreateBlocks } from '../Files/RP/Blocks'
import { CreateItemTexture } from '../Files/RP/ItemTexture'
import { CreateTerrainTexture } from '../Files/RP/TerrainTexture'
import { CreateFlipbookTextures } from '../Files/RP/FlipbookTextures'
import { CreateBiomesClient } from '../Files/RP/BiomesClient'
import { CreateSounds } from '../Files/RP/Sounds'
import { CreateSoundDefintions } from '../Files/RP/SoundDefinitions'
import { CreateSplashes } from '../Files/RP/Splashes'

export class CreateRP extends CreatePack {
	protected readonly packPath = 'RP'
	public createFiles = [
		new CreateManifest(this.packPath),
		new CreateLang(this.packPath),
		new CreatePackIcon(this.packPath),
		new CreateBlocks(),
		new CreateItemTexture(),
		new CreateTerrainTexture(),
		new CreateFlipbookTextures(),
		new CreateBiomesClient(),
		new CreateSounds(),
		new CreateSoundDefintions(),
		new CreateSplashes()
	]
}
