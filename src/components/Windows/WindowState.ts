import { del, markRaw, ref, set, shallowReactive, watch } from 'vue'
import { BaseWindow } from './BaseWindow'
import { NewBaseWindow } from './NewBaseWindow'

export class WindowState {
	public state = ref<Record<string, BaseWindow<any>>>({})
	public isAnyWindowVisible = ref(true)

	constructor() {}

	addWindow(uuid: string, window: BaseWindow<any> | NewBaseWindow<any>) {
		set(this.state.value, uuid, markRaw(window))

		// watch(window.isVisible, () => this.onWindowsChanged())

		// this.onWindowsChanged()
	}
	deleteWindow(uuid: string) {
		del(this.state.value, uuid)

		// this.onWindowsChanged()
	}

	onWindowsChanged() {
		for (const window of Object.values(this.state.value)) {
			if (window.isVisible) {
				this.isAnyWindowVisible.value = true
				return
			}
		}

		this.isAnyWindowVisible.value = false
	}
}
