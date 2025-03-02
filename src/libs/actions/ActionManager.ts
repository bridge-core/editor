import { onMounted, onUnmounted, shallowRef, ShallowRef } from 'vue'
import { Action } from './Action'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'

export class ActionManager {
	public static actions: Record<string, Action> = {}

	public static actionsUpdated: Event<void> = new Event()

	public static addAction(action: Action): Action {
		if (this.actions[action.id]) throw new Error(`An action with the id ${action.id} has already been registered!`)

		this.actions[action.id] = action

		action.updated.on(() => ActionManager.actionsUpdated.dispatch())

		this.actionsUpdated.dispatch()

		return action
	}

	public static removeAction(action: Action) {
		if (!this.actions[action.id]) throw new Error(`No action with the id ${action.id} has been registered!`)

		delete ActionManager.actions[action.id]

		this.actionsUpdated.dispatch()
	}

	public static trigger(id: string, data?: any) {
		if (this.actions[id] === undefined) return

		this.actions[id].trigger(data)
	}
}

export function useActions(): ShallowRef<Record<string, Action>> {
	const current: ShallowRef<Record<string, Action>> = shallowRef(ActionManager.actions)

	function update() {
		//@ts-ignore this value in't acutally read by any code, it just triggers an update
		current.value = null
		current.value = ActionManager.actions
	}

	let disposable: Disposable

	onMounted(() => {
		disposable = ActionManager.actionsUpdated.on(update)
	})

	onUnmounted(() => {
		disposable.dispose()
	})

	return current
}
