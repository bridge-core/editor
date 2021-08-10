import { ref, shallowReactive, watch } from '@vue/composition-api'

export class WindowState {
	static state = shallowReactive<Record<string, any>>({})
	static isAnyWindowVisible = ref(true)

	// Computed doesn't work here because of Vue2 limitations
	private static _ = watch(WindowState.state, () => {
		for (const window of Object.values(WindowState.state)) {
			if (window.isVisible) {
				WindowState.isAnyWindowVisible.value = true
				return
			}
		}

		WindowState.isAnyWindowVisible.value = false
	})
}
