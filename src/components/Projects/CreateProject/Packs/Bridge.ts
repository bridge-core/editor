import { CreateCompilerConfig } from '../Files/Bridge/Compiler'
import { CreateConfig } from '../Files/Bridge/Config'
import { CreatePack } from './Pack'

export class CreateBridge extends CreatePack {
	protected readonly packPath = 'bridge'
	protected createFiles = [new CreateConfig(), new CreateCompilerConfig()]
}
