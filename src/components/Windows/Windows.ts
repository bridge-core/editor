import { Ref, ref, computed } from 'vue'

export class Windows {
	public openWindows: Ref<string[]> = ref([])

	public open(name: string) {
		this.openWindows.value.push(name)
		this.openWindows.value = this.openWindows.value
	}

	public close(name: string) {
		this.openWindows.value.splice(this.openWindows.value.indexOf(name), 1)
		this.openWindows.value = this.openWindows.value
	}

	public opened(name: string) {
		return computed(() => this.openWindows.value.includes(name))
	}
}
