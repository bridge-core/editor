import { ActionManager } from './ActionManager'
import { IKeyBindingConfig, KeyBinding } from './KeyBinding'
import { v4 as uuid } from 'uuid'
import { EventDispatcher } from '../Common/Event/EventDispatcher'
import { IActionConfig, SimpleAction } from './SimpleAction'

export class Action extends SimpleAction {
	id: string
	protected _keyBinding: KeyBinding | undefined

	constructor(
		protected actionManager: ActionManager,
		protected config: IActionConfig
	) {
		super(config)
		this.id = config.id ?? uuid()

		if (!config.description) {
			throw new Error(
				`You need to provide a description for complex actions: ${config.name} has none`
			)
		}

		if (config.keyBinding)
			this.addKeyBinding(
				KeyBinding.fromStrKeyCode(
					actionManager.app.keyBindingManager,
					config.keyBinding,
					true,
					config.prevent
				)
			)
	}

	get keyBinding() {
		return this._keyBinding
	}

	addKeyBinding(keyBinding: KeyBinding) {
		this._keyBinding = keyBinding
		keyBinding.on(() => this.trigger())
		return this
	}
	disposeKeyBinding() {
		if (this._keyBinding) this._keyBinding.dispose()
	}

	dispose() {
		this.actionManager.disposeAction(this.id)
		this.disposeKeyBinding()
	}
}
