import { CreateCompilerConfig } from '../Files/Bridge/Compiler'
import { CreatePack } from './Pack'

export class CreateBridge extends CreatePack {
	protected readonly packPath = '.bridge'
	protected createFiles = [new CreateCompilerConfig()]
}
