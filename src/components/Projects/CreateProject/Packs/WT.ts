import { CreateManifest } from '../Files/Manifest'
import { CreatePack } from './Pack'

export class CreateWT extends CreatePack {
	protected readonly packPath = 'WT'
	public createFiles = [new CreateManifest(this.packPath)]
}
