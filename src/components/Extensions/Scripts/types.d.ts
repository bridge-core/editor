import { IDisposable } from '../../Types/disposable'
import { TUIStore } from '../UI/store'

export interface IModuleConfig {
	extensionId: string
	uiStore?: TUIStore
	disposables: IDisposable[]
	isGlobal: boolean
}
