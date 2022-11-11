import { CreatePack } from './Pack'
import { CreateManifest } from '../Files/Manifest'
import { CreateLang } from '../Files/SP/Lang'
import { CreatePackIcon } from '../Files/PackIcon'
import { CreateSkins } from '../Files/SP/Skins'

export class CreateSP extends CreatePack {
	protected readonly packPath = 'SP'
	public createFiles = [
		new CreateManifest(this.packPath),
		new CreateLang(this.packPath),
		new CreatePackIcon(this.packPath),
		new CreateSkins(),
	]
}
