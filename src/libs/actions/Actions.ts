import { fileSystem, promptWindow, tabManager } from '@/App'
import { Action } from './Action'
import { TextTab } from '@/components/Tabs/Text/TextTab'
import { dirname, join, parse } from '@/libs/path'
import { getClipboard, setClipboard } from '@/libs/Clipboard'
import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'

export class Actions {
	private static actions: Record<string, Action> = {}

	public static addAction(action: Action) {
		this.actions[action.id] = action
	}

	public static trigger(id: string, data?: any) {
		if (this.actions[id] === undefined) return

		this.actions[id].trigger(data)
	}

	public static setup() {
		this.addAction(
			new Action({
				id: 'save',
				trigger: () => {
					const focusedTab = tabManager.getFocusedTab()

					if (focusedTab === null) return

					if (!(focusedTab instanceof TextTab)) return

					focusedTab.save()
				},
				keyBinding: 'Ctrl + S',
			})
		)

		this.addAction(
			new Action({
				id: 'copy',
				trigger: () => {
					const focusedTab = tabManager.getFocusedTab()

					if (focusedTab === null) return

					if (!(focusedTab instanceof TextTab)) return

					focusedTab.copy()
				},
				keyBinding: 'Ctrl + C',
			})
		)

		this.addAction(
			new Action({
				id: 'paste',
				trigger: () => {
					const focusedTab = tabManager.getFocusedTab()

					if (focusedTab === null) return

					if (!(focusedTab instanceof TextTab)) return

					focusedTab.paste()
				},
				keyBinding: 'Ctrl + V',
			})
		)

		this.addAction(
			new Action({
				id: 'cut',
				trigger: () => {
					const focusedTab = tabManager.getFocusedTab()

					if (focusedTab === null) return

					if (!(focusedTab instanceof TextTab)) return

					focusedTab.cut()
				},
				keyBinding: 'Ctrl + X',
			})
		)

		this.addAction(
			new Action({
				id: 'deleteFileSystemEntry',
				trigger: async (path: unknown) => {
					if (typeof path !== 'string') return

					if (!(await fileSystem.exists(path))) return

					const entry = await fileSystem.getEntry(path)

					if (entry.type === 'directory') {
						await fileSystem.removeDirectory(path)
					}

					if (entry.type === 'file') {
						await fileSystem.removeFile(path)
					}
				},
			})
		)

		this.addAction(
			new Action({
				id: 'createFile',
				trigger: async (path: unknown) => {
					if (typeof path !== 'string') return

					promptWindow.open('Create File', 'File Name', 'File Name', (name) => {
						fileSystem.writeFile(join(path, name), '')
					})
				},
			})
		)

		this.addAction(
			new Action({
				id: 'createFolder',
				trigger: async (path: unknown) => {
					if (typeof path !== 'string') return

					promptWindow.open('Create Folder', 'Folder Name', 'Folder Name', (name) => {
						fileSystem.makeDirectory(join(path, name))
					})
				},
			})
		)

		this.addAction(
			new Action({
				id: 'renameFileSystemEntry',
				trigger: async (path: unknown) => {
					if (typeof path !== 'string') return

					promptWindow.open('Rename', 'Name', 'Name', async (newPath) => {
						if (!(await fileSystem.exists(path))) return

						const entry = await fileSystem.getEntry(path)

						if (entry.type === 'directory') {
							await fileSystem.copyDirectory(path, join(dirname(path), newPath))
							await fileSystem.removeDirectory(path)
						}

						if (entry.type === 'file') {
							await fileSystem.copyFile(path, join(dirname(path), newPath))
							await fileSystem.removeFile(path)
						}
					})
				},
			})
		)

		this.addAction(
			new Action({
				id: 'duplicateFileSystemEntry',
				trigger: async (path: unknown) => {
					if (typeof path !== 'string') return

					if (!(await fileSystem.exists(path))) return

					const entry = await fileSystem.getEntry(path)

					const parsedPath = parse(path)
					const newPathBase = path.substring(0, path.length - parsedPath.ext.length)

					let additionalName = ' copy'
					let newPath = newPathBase + additionalName + parsedPath.ext

					while (await fileSystem.exists(newPath)) {
						additionalName += ' copy'

						newPath = newPathBase + additionalName + parsedPath.ext
					}

					if (entry.type === 'directory') {
						await fileSystem.copyDirectory(path, newPath)
					}

					if (entry.type === 'file') {
						await fileSystem.copyFile(path, newPath)
					}
				},
			})
		)

		this.addAction(
			new Action({
				id: 'copyFileSystemEntry',
				trigger: async (path: unknown) => {
					if (typeof path !== 'string') return

					if (!(await fileSystem.exists(path))) return

					setClipboard(await fileSystem.getEntry(path))
				},
			})
		)

		this.addAction(
			new Action({
				id: 'pasteFileSystemEntry',
				trigger: async (path: unknown) => {
					if (typeof path !== 'string') return

					const clipboardEntry = getClipboard()

					if (!(clipboardEntry instanceof BaseEntry)) return

					const sourceEntry = await fileSystem.getEntry(path)

					const parsedPath = parse(clipboardEntry.path)
					const newPathBase = join(sourceEntry.type === 'directory' ? path : dirname(path), parsedPath.name)

					let additionalName = ' copy'
					let newPath = newPathBase + additionalName + parsedPath.ext

					while (await fileSystem.exists(newPath)) {
						additionalName += ' copy'

						newPath = newPathBase + additionalName + parsedPath.ext
					}

					if (clipboardEntry.type === 'directory') {
						await fileSystem.copyDirectory(clipboardEntry.path, newPath)
					}

					if (clipboardEntry.type === 'file') {
						await fileSystem.copyFile(clipboardEntry.path, newPath)
					}
				},
			})
		)

		this.addAction(
			new Action({
				id: 'format',
				trigger: () => {
					const focusedTab = tabManager.getFocusedTab()

					if (focusedTab === null) return

					if (!(focusedTab instanceof TextTab)) return

					focusedTab.format()
				},
			})
		)

		this.addAction(
			new Action({
				id: 'goToSymbol',
				trigger: () => {
					const focusedTab = tabManager.getFocusedTab()

					if (focusedTab === null) return

					if (!(focusedTab instanceof TextTab)) return

					focusedTab.goToSymbol()
				},
			})
		)
	}
}
