import { IKeyBindingConfig } from './KeyBinding'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { v4 as uuid } from 'uuid'

export interface IActionConfig {
	id?: string
	icon: string
	name: string
	description?: string
	keyBinding?: string
	prevent?: IKeyBindingConfig['prevent']
	onTrigger: () => Promise<unknown> | unknown
}

export class SimpleAction extends EventDispatcher<void> {
	id: string

	constructor(protected config: IActionConfig) {
		super()
		this.id = config.id ?? uuid()
	}

	//#region GETTERS
	get name() {
		return this.config.name
	}
	get icon() {
		return this.config.icon
	}
	get description() {
		return this.config.description
	}
	//#endregion

	async trigger() {
		this.dispatch()
		return await this.config.onTrigger()
	}
}
