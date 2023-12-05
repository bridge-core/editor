import { ref } from 'vue'

export class FileExplorer {
	public open = ref(true)

	public toggle() {
		this.open.value = !this.open.value
	}
}
