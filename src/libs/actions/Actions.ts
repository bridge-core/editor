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
import { ProjectManager } from '@/libs/project/ProjectManager'
import { ArrayElement, DeleteElementEdit, ObjectElement, ReplaceEdit, TreeElements, ValueElement } from '@/components/Tabs/TreeEditor/Tree'
import { exportAsBrProject } from '@/libs/export/exporters/BrProject'
import { exportAsMcAddon } from '@/libs/export/exporters/McAddon'
import { exportAsTemplate } from '@/libs/export/exporters/McTemplate'
import { importFromBrProject } from '@/libs/import/BrProject'
import { importFromMcAddon } from '@/libs/import/McAddon'
import { importFromMcPack } from '@/libs/import/McPack'
import { openUrl } from '@/libs/OpenUrl'

export function setupActions() {
	setupEditActions()

	setupFileSystemActions()

	setupCodeEditorActions()

	ActionManager.addAction(
		new Action({
			id: 'clearNotifications',
			execute: () => {
				NotificationSystem.clearNotifications()
			},
			name: 'actions.clearNotifications.name',
			description: 'actions.clearNotifications.description',
			icon: 'delete_forever',
		})
	)

	const goHome = ActionManager.addAction(
		new Action({
			id: 'goHome',
			execute: () => {
				ProjectManager.closeProject()
			},
			name: 'actions.goHome.name',
			description: 'actions.goHome.description',
			icon: 'home',
		})
	)

	ProjectManager.updatedCurrentProject.on(() => {
		if (ProjectManager.currentProject !== null) {
			goHome.enable()
		} else {
			goHome.disable()
		}
	})

	ActionManager.addAction(
		new Action({
			id: 'openSettings',
			execute: () => {
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
			execute: () => {
				ExtensionLibraryWindow.open()
			},
			name: 'actions.extensions.name',
			description: 'actions.extensions.description',
			icon: 'extension',
		})
	)

	setupExportActions()

	ActionManager.addAction(
		new Action({
			id: 'importProject',
			execute: async () => {
				const files = await window.showOpenFilePicker({
					multiple: false,
					types: [
						{
							description: 'Choose a Project',
							accept: {
								'application/zip': ['.brproject', '.mcaddon', '.mcpack'],
							},
						},
					],
				})

				if (!files) return

				const file = files[0]

				if (file.name.endsWith('.mcaddon')) {
					await importFromMcAddon(await (await file.getFile()).arrayBuffer(), basename(file.name, '.mcaddon'))
				} else if (file.name.endsWith('.mcpack')) {
					await importFromMcPack(await (await file.getFile()).arrayBuffer(), basename(file.name, '.mcpack'))
				} else {
					await importFromBrProject(await (await file.getFile()).arrayBuffer(), basename(file.name, '.brproject'))
				}
			},
			name: 'actions.importProject.name',
			description: 'actions.importProject.description',
			icon: 'package',
		})
	)

	setupConvertActions()

	ActionManager.addAction(
		new Action({
			id: 'openDownloadGuide',
			execute() {
				openUrl('https://bridge-core.app/guide/download/')
			},
			name: 'actions.download.name',
			description: 'actions.download.description',
			icon: 'download',
		})
	)
}

function setupEditActions() {
	const undo = ActionManager.addAction(
		new Action({
			id: 'undo',
			execute: () => {
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

	const redo = ActionManager.addAction(
		new Action({
			id: 'redo',
			execute: () => {
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

	const save = ActionManager.addAction(
		new Action({
			id: 'save',
			execute: () => {
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

	const copy = ActionManager.addAction(
		new Action({
			id: 'copy',
			execute: () => {
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

	const paste = ActionManager.addAction(
		new Action({
			id: 'paste',
			execute: () => {
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

	const cut = ActionManager.addAction(
		new Action({
			id: 'cut',
			execute: () => {
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

	const deleteAction = ActionManager.addAction(
		new Action({
			id: 'delete',
			execute: () => {
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

	for (const action of [undo, redo, save, copy, paste, cut, deleteAction]) {
		TabManager.focusedTabSystemChanged.on(() => {
			if (TabManager.focusedTabSystem.value === null) {
				action.disable()
			} else {
				action.enable()
			}
		})
	}
}

function setupFileSystemActions() {
	const deleteFileSystemEntry = ActionManager.addAction(
		new Action({
			id: 'deleteFileSystemEntry',
			execute: async (path: unknown) => {
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

	const createFile = ActionManager.addAction(
		new Action({
			id: 'createFile',
			execute: async (path: unknown) => {
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

	const createFolder = ActionManager.addAction(
		new Action({
			id: 'createFolder',
			execute: async (path: unknown) => {
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

	const renameFileSystemEntry = ActionManager.addAction(
		new Action({
			id: 'renameFileSystemEntry',
			execute: async (path: unknown) => {
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

	const duplicateFileSystemEntry = ActionManager.addAction(
		new Action({
			id: 'duplicateFileSystemEntry',
			execute: async (path: unknown) => {
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

	const copyFileSystemEntry = ActionManager.addAction(
		new Action({
			id: 'copyFileSystemEntry',
			execute: async (path: unknown) => {
				if (typeof path !== 'string') return

				if (!(await fileSystem.exists(path))) return

				setClipboard(await fileSystem.getEntry(path))
			},
			name: 'actions.copyFile.name',
			description: 'actions.copyFile.description',
			icon: 'file_copy',
		})
	)

	const pasteFileSystemEntry = ActionManager.addAction(
		new Action({
			id: 'pasteFileSystemEntry',
			execute: async (path: unknown) => {
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

	for (const action of [deleteFileSystemEntry, createFile, createFolder, renameFileSystemEntry, duplicateFileSystemEntry, copyFileSystemEntry, pasteFileSystemEntry]) {
		ProjectManager.updatedCurrentProject.on(() => {
			if (ProjectManager.currentProject === null) {
				action.disable()
			} else {
				action.enable()
			}
		})
	}
}

function setupCodeEditorActions() {
	const format = ActionManager.addAction(
		new Action({
			id: 'format',
			execute: () => {
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

	const goToSymbol = ActionManager.addAction(
		new Action({
			id: 'goToSymbol',
			execute: () => {
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

	const changeAllOccurrences = ActionManager.addAction(
		new Action({
			id: 'changeAllOccurrences',
			execute: () => {
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

	const goToDefinition = ActionManager.addAction(
		new Action({
			id: 'goToDefinition',
			execute: () => {
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

	const viewDocumentation = ActionManager.addAction(
		new Action({
			id: 'viewDocumentation',
			execute: () => {
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
}

function setupExportActions() {
	const exportBrProject = ActionManager.addAction(
		new Action({
			id: 'exportBrProject',
			execute: () => {
				exportAsBrProject()
			},
			name: 'packExplorer.exportAs.brproject',
			icon: 'folder_zip',
		})
	)

	const exportMcAddon = ActionManager.addAction(
		new Action({
			id: 'exportMcAddon',
			execute: () => {
				exportAsMcAddon()
			},
			name: 'packExplorer.exportAs.mcaddon',
			icon: 'deployed_code',
		})
	)

	const exportMcWorld = ActionManager.addAction(
		new Action({
			id: 'exportMcWorld',
			execute: () => {
				exportAsTemplate(true)
			},
			name: 'packExplorer.exportAs.mcworld',
			icon: 'globe',
		})
	)

	const exportMcTemplate = ActionManager.addAction(
		new Action({
			id: 'exportMcTemplate',
			execute: () => {
				exportAsTemplate()
			},
			name: 'packExplorer.exportAs.mctemplate',
			icon: 'package',
		})
	)

	for (const action of [exportBrProject, exportMcAddon, exportMcAddon, exportMcTemplate]) {
		ProjectManager.updatedCurrentProject.on(() => {
			if (ProjectManager.currentProject === null) {
				action.disable()
			} else {
				action.enable()
			}
		})
	}
}

function setupConvertActions() {
	const convertToObject = ActionManager.addAction(
		new Action({
			id: 'convertToObject',
			execute: () => {
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

	const convertToArray = ActionManager.addAction(
		new Action({
			id: 'convertToArray',
			execute: () => {
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

	const convertToNull = ActionManager.addAction(
		new Action({
			id: 'convertToNull',
			execute: () => {
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

	const convertToNumber = ActionManager.addAction(
		new Action({
			id: 'convertToNumber',
			execute: () => {
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

	const convertToString = ActionManager.addAction(
		new Action({
			id: 'convertToString',
			execute: () => {
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

	const convertToBoolean = ActionManager.addAction(
		new Action({
			id: 'convertToBoolean',
			execute: () => {
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

	for (const action of [convertToObject, convertToArray, convertToNull, convertToNumber, convertToString, convertToBoolean]) {
		TabManager.focusedTabSystemChanged.on(() => {
			if (
				TabManager.focusedTabSystem.value === null ||
				TabManager.focusedTabSystem.value.selectedTab.value === null ||
				!(TabManager.focusedTabSystem.value.selectedTab.value instanceof TreeEditorTab)
			) {
				action.disable()
			} else {
				action.enable()
			}
		})
	}
}
