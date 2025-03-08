import { Event } from '@/libs/event/Event'
import { onMounted, onUnmounted, shallowRef, ShallowRef } from 'vue'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'
import { ActionManager } from '../ActionManager'

export class ExportActionManager {
	public static actions: string[] = []

	public static updated: Event<void> = new Event()

	public static addAction(action: string) {
		this.actions.push(action)

		this.updated.dispatch()
	}

	public static removeAction(action: string) {
		this.actions.splice(this.actions.indexOf(action), 1)

		this.updated.dispatch()
	}
}

export function useExportActions(): ShallowRef<string[]> {
	const current: ShallowRef<string[]> = shallowRef(ExportActionManager.actions)

	function update() {
		current.value = [...ExportActionManager.actions.filter((action) => ActionManager.actions[action]?.enabled)]
	}

	const disposables: Disposable[] = []

	onMounted(() => {
		disposables.push(ExportActionManager.updated.on(update))
		disposables.push(ActionManager.actionsUpdated.on(update))
	})

	onUnmounted(() => {
		disposeAll(disposables)
	})

	return current
}
