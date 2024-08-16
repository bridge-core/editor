import { Action } from './Action'

export class ActionManager {
	public static actions: Record<string, Action> = {}

	/**
	 * @description Adds an action to the bridge's action manager.
	 * @param action The action to add.
	 */
	public static addAction(action: Action) {
		this.actions[action.id] = action
	}

	/**
	 * @description Triggers an action.
	 * @param id The id of the registered action to trigger.
	 * @param data The data to pass to the action if there is any.
	 */
	public static trigger(id: string, data?: any) {
		if (this.actions[id] === undefined) return

		this.actions[id].trigger(data)
	}
}
