import { Event } from '@/libs/event/Event'
import { onMounted, onUnmounted, shallowRef, ShallowRef } from 'vue'
import { Disposable } from '@/libs/disposeable/Disposeable'

export class ExportActionManager {
	public static exportActions: string[] = []

	public static updated: Event<void> = new Event()

	public static addExportAction(action: string) {
		this.exportActions.push(action)

		this.updated.dispatch()
	}

	public static removeExportAction(action: string) {
		this.exportActions.splice(this.exportActions.indexOf(action), 1)

		this.updated.dispatch()
	}
}

export function useExportActions(): ShallowRef<string[]> {
	const current: ShallowRef<string[]> = shallowRef(ExportActionManager.exportActions)

	function update() {
		current.value = [...ExportActionManager.exportActions]
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
