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
import { SettingsWindow } from '@/components/Windows/Settings/SettingsWindow'
import { ExtensionLibraryWindow } from '@/components/Windows/ExtensionLibrary/ExtensionLibrary'
import { ProjectManager } from '../project/ProjectManager'
import {
	ArrayElement,
	DeleteElementEdit,
	ObjectElement,
	ReplaceEdit,
	TreeElements,
	ValueElement,
} from '@/components/Tabs/TreeEditor/Tree'

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

				if (focusedTab instanceof TextTab) focusedTab.save()
				if (focusedTab instanceof TreeEditorTab) focusedTab.save()
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
			id: 'delete',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TreeEditorTab)) return

				if (focusedTab.contextTree.value) {
					focusedTab.edit(new DeleteElementEdit(focusedTab.contextTree.value.tree))
				} else if (focusedTab.selectedTree.value) {
					focusedTab.edit(new DeleteElementEdit(focusedTab.selectedTree.value.tree))
				}
			},
			keyBinding: 'Delete',
			name: 'actions.delete.name',
			description: 'actions.delete.description',
			icon: 'delete',
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

	ActionManager.addAction(
		new Action({
			id: 'goHome',
			trigger: () => {
				ProjectManager.closeProject()
			},
			name: 'actions.goHome.name',
			description: 'actions.goHome.description',
			icon: 'home',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'openSettings',
			trigger: () => {
				SettingsWindow.open()
			},
			keyBinding: 'Ctrl + ,',
			name: 'actions.settings.name',
			description: 'actions.settings.description',
			icon: 'settings',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'openExtensions',
			trigger: () => {
				ExtensionLibraryWindow.open()
			},
			name: 'actions.extensions.name',
			description: 'actions.extensions.description',
			icon: 'extension',
		})
	)

	setupConvertActions()
}

function setupConvertActions() {
	ActionManager.addAction(
		new Action({
			id: 'convertToObject',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TreeEditorTab)) return

				let element: TreeElements = <any>null

				if (focusedTab.contextTree.value) {
					element = focusedTab.contextTree.value.tree
				} else if (focusedTab.selectedTree.value) {
					element = focusedTab.selectedTree.value.tree
				}

				let newElement = new ObjectElement()

				if (element instanceof ArrayElement) {
					for (const child of element.children) {
						const newChild = child.clone()
						newChild.key = child.key!.toString()
						newChild.parent = newElement

						newElement.children[child.key!.toString()] = newChild
					}
				}

				focusedTab.edit(
					new ReplaceEdit(element, newElement, (element) => {
						focusedTab.tree.value = element
					})
				)
			},
			name: 'actions.convertToObject.name',
			description: 'actions.convertToObject.description',
			icon: 'swap_horiz',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'convertToArray',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TreeEditorTab)) return

				let element: TreeElements = <any>null

				if (focusedTab.contextTree.value) {
					element = focusedTab.contextTree.value.tree
				} else if (focusedTab.selectedTree.value) {
					element = focusedTab.selectedTree.value.tree
				}

				let newElement = new ArrayElement()

				if (element instanceof ObjectElement) {
					let index = 0
					for (const child of Object.values(element.children)) {
						const newChild = child.clone()
						newChild.key = index
						newChild.parent = newElement

						newElement.children[index] = newChild

						index++
					}
				}

				focusedTab.edit(
					new ReplaceEdit(element, newElement, (element) => {
						focusedTab.tree.value = element
					})
				)
			},
			name: 'actions.convertToArray.name',
			description: 'actions.convertToArray.description',
			icon: 'swap_horiz',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'convertToNull',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TreeEditorTab)) return

				let element: TreeElements = <any>null

				if (focusedTab.contextTree.value) {
					element = focusedTab.contextTree.value.tree
				} else if (focusedTab.selectedTree.value) {
					element = focusedTab.selectedTree.value.tree
				}

				let newElement = new ValueElement(element.parent, element.key, null)

				focusedTab.edit(
					new ReplaceEdit(element, newElement, (element) => {
						focusedTab.tree.value = element
					})
				)
			},
			name: 'actions.convertToNull.name',
			description: 'actions.convertToNull.description',
			icon: 'swap_horiz',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'convertToNumber',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TreeEditorTab)) return

				let element: TreeElements = <any>null

				if (focusedTab.contextTree.value) {
					element = focusedTab.contextTree.value.tree
				} else if (focusedTab.selectedTree.value) {
					element = focusedTab.selectedTree.value.tree
				}

				let newElement = new ValueElement(element.parent, element.key, 0)

				if (element instanceof ValueElement && typeof element.value === 'string') {
					try {
						newElement.value = parseFloat(element.value)

						if (isNaN(newElement.value)) newElement.value = 0
					} catch {}
				}

				focusedTab.edit(
					new ReplaceEdit(element, newElement, (element) => {
						focusedTab.tree.value = element
					})
				)
			},
			name: 'actions.convertToNumber.name',
			description: 'actions.convertToNumber.description',
			icon: 'swap_horiz',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'convertToString',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TreeEditorTab)) return

				let element: TreeElements = <any>null

				if (focusedTab.contextTree.value) {
					element = focusedTab.contextTree.value.tree
				} else if (focusedTab.selectedTree.value) {
					element = focusedTab.selectedTree.value.tree
				}

				let newElement = new ValueElement(element.parent, element.key, '')

				if (element instanceof ValueElement) {
					newElement.value = element.value?.toString() ?? 'null'
				}

				focusedTab.edit(
					new ReplaceEdit(element, newElement, (element) => {
						focusedTab.tree.value = element
					})
				)
			},
			name: 'actions.convertToString.name',
			description: 'actions.convertToString.description',
			icon: 'swap_horiz',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'convertToBoolean',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TreeEditorTab)) return

				let element: TreeElements = <any>null

				if (focusedTab.contextTree.value) {
					element = focusedTab.contextTree.value.tree
				} else if (focusedTab.selectedTree.value) {
					element = focusedTab.selectedTree.value.tree
				}

				let newElement = new ValueElement(element.parent, element.key, true)

				if (element instanceof ValueElement) {
					if (element.value === 'false') newElement.value = false
				}

				focusedTab.edit(
					new ReplaceEdit(element, newElement, (element) => {
						focusedTab.tree.value = element
					})
				)
			},
			name: 'actions.convertToBoolean.name',
			description: 'actions.convertToBoolean.description',
			icon: 'swap_horiz',
		})
	)
}
