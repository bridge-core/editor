import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'
import { Ref, ref } from 'vue'

export class FileExplorer {
	public static open = ref(true)

	public static draggedItem: Ref<BaseEntry | null> = ref(null)

	public static toggle() {
		FileExplorer.open.value = !FileExplorer.open.value
	}
}
