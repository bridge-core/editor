import { ShallowRef, shallowRef } from 'vue'

interface WindowProvider {
	component: any
	id: string
}

export class Windows {
	public static openWindows: ShallowRef<WindowProvider[]> = shallowRef([])

	public static open(window: WindowProvider) {
		if (Windows.openWindows.value.includes(window)) return

		Windows.openWindows.value.push(window)
		Windows.openWindows.value = [...Windows.openWindows.value]
	}

	public static close(window: WindowProvider) {
		if (!Windows.openWindows.value.includes(window)) return

		Windows.openWindows.value.splice(Windows.openWindows.value.indexOf(window), 1)
		Windows.openWindows.value = [...Windows.openWindows.value]
	}

	public static windowIsOpen(window: WindowProvider) {
		return Windows.openWindows.value.includes(window)
	}
}
