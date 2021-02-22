import { CreatePack } from './Pack'
import { CreateManifest } from '../Files/Manifest'
import { CreateLang } from '../Files/Lang'
import { CreatePackIcon } from '../Files/PackIcon'
import { CreateSkins } from '../Files/SP/Skins'

export class CreateSP extends CreatePack {
	protected readonly packPath = 'SP'
	protected createFiles = [
		new CreateManifest(this.packPath),
		new CreateLang(this.packPath),
		new CreatePackIcon(this.packPath),
		new CreateSkins(),
	]
}
