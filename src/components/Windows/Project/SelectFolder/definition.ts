import { createWindow, TWindow } from '../../create'
import SelectProjectFolder from './Main.vue'

let window: TWindow
export function createSelectProjectFolderWindow(
	callback: (fileHandle: FileSystemDirectoryHandle) => void
) {
	if (window) return window

	window = createWindow(SelectProjectFolder, {
		callback: async (fileHandle: FileSystemDirectoryHandle) => {
			await callback(fileHandle)
			window.status.setDone?.()
		},
	})
	window.open()
	return window
}
