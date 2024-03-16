import { Ref, ref, computed } from 'vue'
import { Window } from './Window'

export class Windows {
	public static openWindows: Ref<Window[]> = ref([])

	public static open(window: Window) {
		Windows.openWindows.value.push(window)
		Windows.openWindows.value = Windows.openWindows.value

		console.log(Windows.openWindows.value)
	}

	public static close(window: Window) {
		Windows.openWindows.value.splice(Windows.openWindows.value.indexOf(window), 1)
		Windows.openWindows.value = Windows.openWindows.value
	}

	public static opened(window: Window) {
		return Windows.openWindows.value.includes(window)
	}

	public static openedType(window: Window) {
		return Windows.openWindows.value.find((window) => window.id === window.id) !== undefined
	}
}
