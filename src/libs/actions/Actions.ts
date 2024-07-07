import { PromptWindow } from '@/components/Windows/Prompt/PromptWindow'
import { TabManager } from '@/components/TabSystem/TabManager'
import { TextTab } from '@/components/Tabs/Text/TextTab'
import { basename, dirname, join, parse } from 'pathe'
import { getClipboard, setClipboard } from '@/libs/Clipboard'
import { BaseEntry } from '@/libs/fileSystem/BaseFileSystem'
import { ActionManager } from './ActionManager'
import { Action } from './Action'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { Windows } from '@/components/Windows/Windows'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { TreeEditorTab } from '@/components/Tabs/TreeEditor/TreeEditorTab'

export function setupActions() {
	ActionManager.addAction(
		new Action({
			id: 'undo',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TreeEditorTab)) return

				focusedTab.undo()
			},
			keyBinding: 'Ctrl + Z',
			name: 'actions.undo.name',
			description: 'actions.undo.description',
			icon: 'undo',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'redo',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TreeEditorTab)) return

				focusedTab.redo()
			},
			keyBinding: 'Ctrl + Y',
			name: 'actions.redo.name',
			description: 'actions.redo.description',
			icon: 'redo',
		})
	)

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
			name: 'actions.saveFile.name',
			description: 'actions.saveFile.description',
			icon: 'save',
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
			name: 'actions.copy.name',
			description: 'actions.copy.description',
			icon: 'content_copy',
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
			name: 'actions.paste.name',
			description: 'actions.paste.description',
			icon: 'content_paste',
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
			name: 'actions.cut.name',
			description: 'actions.cut.description',
			icon: 'content_cut',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'deleteFileSystemEntry',
			trigger: async (path: unknown) => {
				if (typeof path !== 'string') return

				if (!(await fileSystem.exists(path))) return

				const entry = await fileSystem.getEntry(path)

				if (entry.kind === 'directory') {
					await fileSystem.removeDirectory(path)
				}

				if (entry.kind === 'file') {
					await fileSystem.removeFile(path)
				}
			},
			name: 'actions.delete.name',
			description: 'actions.delete.description',
			icon: 'delete',
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
			name: 'actions.createFile.name',
			description: 'actions.createFile.description',
			icon: 'note_add',
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
			name: 'actions.createFolder.name',
			description: 'actions.createFolder.description',
			icon: 'create_new_folder',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'renameFileSystemEntry',
			trigger: async (path: unknown) => {
				if (typeof path !== 'string') return

				if (!(await fileSystem.exists(path))) return
				const fileName = basename((await fileSystem.getEntry(path)).path)

				Windows.open(
					new PromptWindow(
						'Rename',
						'Name',
						'Name',
						async (newPath) => {
							if (!(await fileSystem.exists(path))) return

							const entry = await fileSystem.getEntry(path)

							if (entry.kind === 'directory') {
								await fileSystem.copyDirectory(path, join(dirname(path), newPath))
								await fileSystem.removeDirectory(path)
							}

							if (entry.kind === 'file') {
								await fileSystem.copyFile(path, join(dirname(path), newPath))
								await fileSystem.removeFile(path)
							}
						},
						() => {},
						fileName
					)
				)
			},
			name: 'actions.rename.name',
			description: 'actions.rename.description',
			icon: 'text_fields_alt',
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

				if (entry.kind === 'directory') {
					await fileSystem.copyDirectory(path, newPath)
				}

				if (entry.kind === 'file') {
					await fileSystem.copyFile(path, newPath)
				}
			},
			name: 'actions.duplicate.name',
			description: 'actions.duplicate.description',
			icon: 'file_copy',
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
			name: 'actions.copyFile.name',
			description: 'actions.copyFile.description',
			icon: 'file_copy',
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
				const newPathBase = join(sourceEntry.kind === 'directory' ? path : dirname(path), parsedPath.name)

				let additionalName = ' copy'
				let newPath = newPathBase + additionalName + parsedPath.ext

				while (await fileSystem.exists(newPath)) {
					additionalName += ' copy'

					newPath = newPathBase + additionalName + parsedPath.ext
				}

				if (clipboardEntry.kind === 'directory') {
					await fileSystem.copyDirectory(clipboardEntry.path, newPath)
				}

				if (clipboardEntry.kind === 'file') {
					await fileSystem.copyFile(clipboardEntry.path, newPath)
				}
			},
			name: 'actions.pasteFile.name',
			description: 'actions.pasteFile.description',
			icon: 'content_paste',
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
			name: 'actions.formatDocument.name',
			description: 'actions.formatDocument.description',
			icon: 'edit_document',
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
			name: 'actions.goToSymbol.name',
			description: 'actions.goToSymbol.description',
			icon: 'arrow_forward',
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
			name: 'actions.changeAllOccurrences.name',
			description: 'actions.changeAllOccurrences.description',
			icon: 'change_circle', // TODO: Pick a better icon
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
			name: 'actions.goToDefinition.name',
			description: 'actions.goToDefinition.description',
			icon: 'search',
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
			name: 'actions.documentationLookup.name',
			description: 'actions.documentationLookup.description',
			icon: 'menu_book',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'clearNotifications',
			trigger: () => {
				NotificationSystem.clearNotifications()
			},
			name: 'actions.clearNotifications.name',
			description: 'actions.clearNotifications.description',
			icon: 'delete_forever',
		})
	)
}
