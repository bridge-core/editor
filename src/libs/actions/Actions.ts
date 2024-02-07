import { Action } from './Action'

export class Actions {
	private static actions: Record<string, Action> = {}

	public static addAction(action: Action) {
		this.actions[action.id] = action
	}

	public static trigger(id: string) {
		console.warn('Triggering action', id)

		if (this.actions[id] === undefined) return

		this.actions[id].trigger()
	}

	public static setup() {}
}
