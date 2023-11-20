import { ref } from 'vue'

export class FileBrowser {
	public open = ref(true)

	public toggle() {
		this.open.value = !this.open.value
	}
}
