import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'
import { Settings } from '@/libs/settings/Settings'
import { Ref, ref } from 'vue'

export class FileExplorer {
	public static open = ref(true)

	public static draggedItem: Ref<BaseEntry | null> = ref(null)

	public static setup() {
		Settings.addSetting('fileExplorerIndentation', {
			default: 'normal',
		})
	}

	public static toggle() {
		FileExplorer.open.value = !FileExplorer.open.value
	}

	public static isItemDragging(): boolean {
		return this.draggedItem.value !== null
	}
}
