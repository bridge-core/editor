import { Event } from '@/libs/event/Event'
import { onMounted, onUnmounted, shallowRef, ShallowRef } from 'vue'
import { Disposable } from '@/libs/disposeable/Disposeable'

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
		current.value = [...ExportActionManager.actions]
	}

	let disposable: Disposable

	onMounted(() => {
		disposable = ExportActionManager.updated.on(update)
	})

	onUnmounted(() => {
		disposable.dispose()
	})

	return current
}
