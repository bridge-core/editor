import { createWindow } from '../../create'
import SelectProjectFolder from './Main.vue'

let isOpen = false
export function createSelectProjectFolderWindow(
	callback: (fileHandle: FileSystemDirectoryHandle) => void
) {
	if (isOpen) return

	isOpen = true
	const window = createWindow(SelectProjectFolder, { callback })
	window.open()
	return window
}
