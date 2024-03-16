import { ref } from 'vue'

export class FileExplorer {
	public static open = ref(true)

	public static toggle() {
		FileExplorer.open.value = !FileExplorer.open.value
	}
}
