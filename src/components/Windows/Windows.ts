import { Ref, ref, computed } from 'vue'

export class Windows {
	public static openWindows: Ref<string[]> = ref([])

	public static open(name: string) {
		Windows.openWindows.value.push(name)
		Windows.openWindows.value = Windows.openWindows.value
	}

	public static close(name: string) {
		Windows.openWindows.value.splice(Windows.openWindows.value.indexOf(name), 1)
		Windows.openWindows.value = Windows.openWindows.value
	}

	public static opened(name: string) {
		return computed(() => Windows.openWindows.value.includes(name))
	}
}
