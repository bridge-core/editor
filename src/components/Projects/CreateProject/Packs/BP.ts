import { CreatePack } from './Pack'
import { CreateManifest } from '../Files/Manifest'
import { CreateLang } from '../Files/Lang'
import { CreatePackIcon } from '../Files/PackIcon'
import { CreateTick } from '../Files/BP/CreateTick'
import { CreateGameTestMain } from '../Files/BP/GameTest'

export class CreateBP extends CreatePack {
	protected readonly packPath = 'BP'
	protected createFiles = [
		new CreateManifest(this.packPath),
		new CreateLang(this.packPath),
		new CreatePackIcon(this.packPath),
		new CreateTick(),
		new CreateGameTestMain(),
	]
}
