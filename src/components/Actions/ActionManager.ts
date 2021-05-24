import { Action } from './Action'
import { IActionConfig } from './SimpleAction'
import { del, set, shallowReactive } from '@vue/composition-api'
import type { KeyBindingManager } from './KeyBindingManager'

export class ActionManager {
	public state: Record<string, Action> = shallowReactive({})

	constructor(public readonly _keyBindingManager?: KeyBindingManager) {}

	get keyBindingManager() {
		if (!this._keyBindingManager)
			throw new Error(
				`No keyBindingManager was defined for this actionManager`
			)

		return this._keyBindingManager
	}

	create(actionConfig: IActionConfig) {
		const action = new Action(this, actionConfig)
		set(this.state, action.id, action)
		return action
	}
	disposeAction(actionId: string) {
		del(this.state, actionId)
	}
	dispose() {
		Object.values(this.state).forEach((action) => action.dispose())
	}

	async trigger(actionId: string) {
		if (!this.state[actionId])
			throw new Error(
				`Failed to trigger "${actionId}": Action does not exist.`
			)

		await this.state[actionId].trigger()
	}
}
