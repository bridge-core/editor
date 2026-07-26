import { getCurrentWebview } from '@tauri-apps/api/webview'
import { readFile, stat } from '@tauri-apps/plugin-fs'
import { basename } from 'pathe'
import { ImporterManager } from '@/libs/import/ImporterManager'
import { ImportedDirectoryEntry, ImportedFileEntry } from '@/libs/fileSystem/FileSystem'
import { TauriFileSystem } from '@/libs/fileSystem/TauriFileSystem'

// Wires up native file drag and drop for the Tauri build.
// With `dragDropEnabled: true` the webview no longer receives HTML5 file drop events; instead Tauri emits a drag-drop event carrying the absolute paths of the dropped items.
export async function setupTauriDragDrop() {
	await getCurrentWebview().onDragDropEvent(async (event) => {
		if (event.payload.type !== 'drop') return

		for (const path of event.payload.paths) {
			const info = await stat(path)

			if (info.isDirectory) {
				const directoryFileSystem = new TauriFileSystem()
				directoryFileSystem.setBasePath(path)

				await ImporterManager.importDirectory(new ImportedDirectoryEntry('/' + basename(path), directoryFileSystem))
			} else {
				const data = await readFile(path)

				await ImporterManager.importFile(new ImportedFileEntry('/' + basename(path), data.buffer as ArrayBuffer))
			}
		}
	})
}