import { App } from '/@/App'
import Vue from 'vue'
import { Action, IActionConfig } from './Action'

export class ActionManager {
	public state: Record<string, Action> = Vue.observable({})

	constructor(public readonly app: App) {}

	create(actionConfig: IActionConfig) {
		const action = new Action(this, actionConfig)
		Vue.set(this.state, action.id, action)
		return action
	}
	disposeAction(actionId: string) {
		Vue.delete(this.state, actionId)
	}
	dispose() {
		Object.values(this.state).forEach(action => action.dispose())
	}

	async trigger(actionId: string) {
		if (!this.state[actionId])
			throw new Error(
				`Failed to trigger "${actionId}": Action does not exist.`
			)

		await this.state[actionId].trigger()
	}
}
