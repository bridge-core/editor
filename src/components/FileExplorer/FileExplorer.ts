import { Ref, ref } from 'vue'

export class FileExplorer {
	public static open = ref(true)

	public static draggedItem: Ref<string | null> = ref(null)

	public static toggle() {
		FileExplorer.open.value = !FileExplorer.open.value
	}
}
