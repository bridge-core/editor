import Vue from 'vue'
import { Action, IActionConfig } from './Action'

export class ActionManager {
	public state: Record<string, Action> = Vue.observable({})

	constructor() {}

	addAction(actionId: string, actionConfig: IActionConfig) {
		if (this.state[actionId])
			throw new Error(`Action with id "${actionId}" already exists.`)

		const action = new Action(this, actionId, actionConfig)
		Vue.set(this.state, actionId, action)
	}
	disposeAction(actionId: string) {
		Vue.delete(this.state, actionId)
	}

	async trigger(actionId: string) {
		if (!this.state[actionId])
			throw new Error(
				`Failed to trigger "${actionId}": Action does not exist.`
			)

		await this.state[actionId].trigger()
	}
}
