import { EventDispatcher } from '../EventSystem'

interface IActionConfig {
	id: string
	name: string
	description: string
	icon?: string
	onAction: () => void
}

export class ActionManager {
	protected actions = new Set<Action>()

	constructor() {}

	createAction(actionConfig: IActionConfig) {
		const action = new Action(actionConfig)
		this.actions.add(action)

		return {
			dispose: () => {
				this.actions.delete(action)
			},
		}
	}
}

export class Action {
	protected dispatcher = new EventDispatcher<void>()

	constructor(protected actionConfig: IActionConfig) {
		this.dispatcher.on(actionConfig.onAction)
	}

	dispatch() {
		this.dispatcher.dispatch()
	}
}
