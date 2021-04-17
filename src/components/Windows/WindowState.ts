import { computed, reactive, ref, watch } from '@vue/composition-api'
import { setupCompositionAPI } from '../App/setupCompositionAPI'

setupCompositionAPI()
export class WindowState {
	static state = reactive<Record<string, any>>({})
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
