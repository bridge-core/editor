import { Action } from './Action'

export class ActionManager {
	private static actions: Record<string, Action> = {}

	public static addAction(action: Action) {
		this.actions[action.id] = action
	}

	public static trigger(id: string, data?: any) {
		if (this.actions[id] === undefined) return

		this.actions[id].trigger(data)
	}
}
