import { Event } from '@/libs/event/Event'
import { onMounted, onUnmounted, shallowRef, ShallowRef } from 'vue'
import { Disposable } from '@/libs/disposeable/Disposeable'

export class FileActionManager {
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

export function useFileActions(fileType: string): ShallowRef<string[]> {
	const current: ShallowRef<string[]> = shallowRef(FileActionManager.actions.filter((item) => item.fileTypes.includes(fileType)).map((item) => item.action))

	function update() {
		current.value = [...FileActionManager.actions.filter((item) => item.fileTypes.includes(fileType)).map((item) => item.action)]
	}

	let disposable: Disposable | undefined

	onMounted(() => {
		disposable = FileActionManager.updated.on(update)
	})

	onUnmounted(() => {
		disposable?.dispose()
	})

	return current
}
