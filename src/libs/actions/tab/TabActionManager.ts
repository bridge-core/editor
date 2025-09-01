import { Event } from '@/libs/event/Event'
import { onMounted, onUnmounted, shallowRef, ShallowRef } from 'vue'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'
import { ActionManager } from '../ActionManager'

export class TabActionManager {
	public static actions: { action: string; fileTypes: string[] }[] = []

	public static updated: Event<void> = new Event()

	public static addAction(action: string, fileTypes: string[]) {
		this.actions.push({ action, fileTypes })

		this.updated.dispatch()
	}

	public static removeAction(action: string) {
		this.actions.splice(
			this.actions.findIndex((item) => item.action === action),
			1
		)

		this.updated.dispatch()
	}
}

export function useTabActions(fileType: string): ShallowRef<string[]> {
	const current: ShallowRef<string[]> = shallowRef(
		TabActionManager.actions.filter((item) => item.fileTypes.includes(fileType)).map((item) => item.action)
	)

	function update() {
		current.value = [
			...TabActionManager.actions
				.filter((item) => item.fileTypes.includes(fileType) && ActionManager.actions[item.action]?.visible)
				.map((item) => item.action),
		]
	}

	const disposables: Disposable[] = []

	onMounted(() => {
		disposables.push(TabActionManager.updated.on(update))
		disposables.push(ActionManager.actionsUpdated.on(update))
	})

	onUnmounted(() => {
		disposeAll(disposables)
	})

	return current
}
