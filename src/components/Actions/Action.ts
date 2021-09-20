import { ActionManager } from './ActionManager'
import { KeyBinding } from './KeyBinding'
import { v4 as uuid } from 'uuid'
import { IActionConfig, SimpleAction } from './SimpleAction'

export class Action extends SimpleAction {
	public readonly type = 'action'
	public readonly id: string
	protected _keyBinding: KeyBinding | undefined

	constructor(
		protected actionManager: ActionManager,
		protected config: IActionConfig
	) {
		super(config)
		this.id = config.id ?? uuid()

		if (config.keyBinding) {
			const keyBindings = Array.isArray(config.keyBinding)
				? config.keyBinding
				: [config.keyBinding]

			keyBindings.forEach((keyBinding) =>
				this.addKeyBinding(
					KeyBinding.fromStrKeyCode(
						actionManager.keyBindingManager,
						keyBinding,
						true,
						config.prevent
					)
				)
			)
		}
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
