import { del, markRaw, ref, set, shallowReactive, watch } from 'vue'
import { NewBaseWindow } from './NewBaseWindow'

export class WindowState {
	public state = ref<Record<string, NewBaseWindow<any>>>({})
	public isAnyWindowVisible = ref(true)
	protected watchStop = new Map<string, () => void>()

	constructor() {}

	addWindow(uuid: string, window: NewBaseWindow<any>) {
		set(this.state.value, uuid, markRaw(window))

		this.watchStop.set(
			uuid,
			watch(window.getState(), () => this.onWindowsChanged())
		)

		this.onWindowsChanged()
	}
	deleteWindow(uuid: string) {
		del(this.state.value, uuid)

		const watchStop = this.watchStop.get(uuid)
		if (watchStop) watchStop()
		this.watchStop.delete(uuid)

		this.onWindowsChanged()
	}

	onWindowsChanged() {
		for (const window of Object.values(this.state.value)) {
			if (window.getState().isVisible) {
				this.isAnyWindowVisible.value = true
				return
			}
		}

		this.isAnyWindowVisible.value = false
	}
}
