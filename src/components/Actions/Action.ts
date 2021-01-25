import { ActionManager } from './ActionManager'
import { KeyBinding } from './Keybinding'

export interface IActionConfig {
	icon: string
	name: string
	description: string
	onTrigger: () => Promise<void> | void
}

export class Action {
	protected _keyBinding: KeyBinding | undefined

	constructor(
		protected actionManager: ActionManager,
		public readonly id: string,
		protected config: IActionConfig
	) {}

	get keyBinding() {
		return this._keyBinding
	}

	addKeyBinding(keyBinding: KeyBinding) {
		this._keyBinding = keyBinding
	}
	disposeKeyBinding() {
		if (this._keyBinding) this._keyBinding.dispose()
	}

	async trigger() {
		await this.config.onTrigger()
	}

	dispose() {
		this.actionManager.disposeAction(this.id)
		this.disposeKeyBinding()
	}
}
