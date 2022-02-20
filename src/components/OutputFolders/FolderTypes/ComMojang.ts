import { OutputFolder } from './OutputFolder'

export interface IComMojangDataBag {
	minecraftVersion?: string
}

export class ComMojangFolder extends OutputFolder<IComMojangDataBag> {}
