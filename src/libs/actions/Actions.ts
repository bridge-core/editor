import { PromptWindow } from '@/components/Windows/Prompt/PromptWindow'
import { TabManager } from '@/components/TabSystem/TabManager'
import { TextTab } from '@/components/Tabs/Text/TextTab'
import { dirname, join, parse } from '@/libs/path'
import { getClipboard, setClipboard } from '@/libs/Clipboard'
import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'
import { ActionManager } from './ActionManager'
import { Action } from './Action'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { Windows } from '@/components/Windows/Windows'

export function setupActions() {
	ActionManager.addAction(
		new Action({
			id: 'save',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.save()
			},
			keyBinding: 'Ctrl + S',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'copy',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.copy()
			},
			keyBinding: 'Ctrl + C',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'paste',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.paste()
			},
			keyBinding: 'Ctrl + V',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'cut',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.cut()
			},
			keyBinding: 'Ctrl + X',
		})
	)

	ActionManager.addAction(
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

	ActionManager.addAction(
		new Action({
			id: 'createFile',
			trigger: async (path: unknown) => {
				if (typeof path !== 'string') return

				Windows.open(
					new PromptWindow('Create File', 'File Name', 'File Name', (name) => {
						fileSystem.writeFile(join(path, name), '')
					})
				)
			},
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'createFolder',
			trigger: async (path: unknown) => {
				if (typeof path !== 'string') return

				Windows.open(
					new PromptWindow('Create Folder', 'Folder Name', 'Folder Name', (name) => {
						fileSystem.makeDirectory(join(path, name))
					})
				)
			},
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'renameFileSystemEntry',
			trigger: async (path: unknown) => {
				if (typeof path !== 'string') return

				Windows.open(
					new PromptWindow('Rename', 'Name', 'Name', async (newPath) => {
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
				)
			},
		})
	)

	ActionManager.addAction(
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

	ActionManager.addAction(
		new Action({
			id: 'copyFileSystemEntry',
			trigger: async (path: unknown) => {
				if (typeof path !== 'string') return

				if (!(await fileSystem.exists(path))) return

				setClipboard(await fileSystem.getEntry(path))
			},
		})
	)

	ActionManager.addAction(
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

	ActionManager.addAction(
		new Action({
			id: 'format',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.format()
			},
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'goToSymbol',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.goToSymbol()
			},
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'changeAllOccurrences',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.changeAllOccurrences()
			},
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'goToDefinition',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.goToDefinition()
			},
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'viewDocumentation',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.viewDocumentation()
			},
		})
	)
}
