import { CreateCompilerConfig } from '../Files/Bridge/Compiler'
import { CreatePack } from './Pack'

export class CreateBridge extends CreatePack {
	protected readonly packPath = '.bridge'
	public createFiles = [new CreateCompilerConfig()]
}
