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
import { FileTab } from '@/components/TabSystem/FileTab'
import { Extensions } from '@/libs/extensions/Extensions'
import { FileExplorer } from '@/components/FileExplorer/FileExplorer'
import { CreateProjectWindow } from '@/components/Windows/CreateProject/CreateProjectWindow'

export function setupActions() {
	setupFileTabActions()

	setupEditorActions()

	setupProjectActions()

	setupTextEditorActions()

	setupFileSystemActions()

	setupTextEditorActions()

	setupExportActions()

	setupJsonTreeActions()

	setupHelpActions()
}

function setupFileTabActions() {
	const save = ActionManager.addAction(
		new Action({
			id: 'files.save',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (focusedTab instanceof FileTab) focusedTab.save()
			},
			keyBinding: 'Ctrl + S',
			name: 'actions.files.save.name',
			description: 'actions.files.save.description',
			icon: 'save',
			visible: false,
			category: 'actions.files.name',
		})
	)

	for (const action of [save]) {
		TabManager.focusedTabSystemChanged.on(() => {
			action.setVisible(
				TabManager.focusedTabSystem.value !== null &&
					TabManager.focusedTabSystem.value.selectedTab.value !== null &&
					TabManager.focusedTabSystem.value.selectedTab.value instanceof FileTab
			)
		})
	}
}

function setupEditorActions() {
	const goHome = ActionManager.addAction(
		new Action({
			id: 'editor.goHome',
			trigger: () => {
				ProjectManager.closeProject()
			},
			name: 'actions.editor.goHome.name',
			description: 'actions.editor.goHome.description',
			icon: 'home',
			visible: false,
			category: 'actions.editor.name',
		})
	)

	ProjectManager.updatedCurrentProject.on(() => {
		goHome.setVisible(ProjectManager.currentProject !== null)
	})

	ActionManager.addAction(
		new Action({
			id: 'editor.clearNotifications',
			trigger: () => {
				NotificationSystem.clearNotifications()
			},
			name: 'actions.editor.clearNotifications.name',
			description: 'actions.editor.clearNotifications.description',
			icon: 'delete_forever',
			category: 'actions.editor.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'editor.openSettings',
			trigger: () => {
				SettingsWindow.open()
			},
			keyBinding: 'Ctrl + ,',
			name: 'actions.editor.settings.name',
			description: 'actions.editor.settings.description',
			icon: 'settings',
			category: 'actions.editor.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'editor.openExtensions',
			trigger: () => {
				ExtensionLibraryWindow.open()
			},
			name: 'actions.editor.extensions.name',
			description: 'actions.editor.extensions.description',
			icon: 'extension',
			category: 'actions.editor.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'editor.importProject',
			trigger: async () => {
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
			name: 'actions.editor.importProject.name',
			description: 'actions.editor.importProject.description',
			icon: 'package',
			category: 'actions.editor.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'editor.reloadEditor',
			trigger() {
				location.reload()
			},
			keyBinding: 'Ctrl + R',
			name: 'actions.editor.reloadEditor.name',
			description: 'actions.editor.reloadEditor.description',
			icon: 'refresh',
			category: 'actions.editor.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'editor.nextTab',
			trigger() {
				const tabSystem = TabManager.focusedTabSystem.value

				if (tabSystem === null) return

				tabSystem.nextTab()
			},
			name: 'actions.editor.nextTab.name',
			description: 'actions.editor.nextTab.description',
			icon: 'arrow_right',
			category: 'actions.editor.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'editor.previousTab',
			trigger() {
				const tabSystem = TabManager.focusedTabSystem.value

				if (tabSystem === null) return

				tabSystem.previousTab()
			},
			name: 'actions.editor.previousTab.name',
			description: 'actions.editor.previousTab.description',
			icon: 'arrow_left',
			category: 'actions.editor.name',
		})
	)
}

function setupProjectActions() {
	const projectActions: Action[] = []

	projectActions.push(
		ActionManager.addAction(
			new Action({
				id: 'project.reload',
				async trigger() {
					if (!ProjectManager.currentProject) return

					const currentProjectName = ProjectManager.currentProject.name

					await ProjectManager.closeProject()

					await ProjectManager.loadProject(currentProjectName)
				},
				name: 'actions.project.reload.name',
				description: 'actions.project.reload.description',
				icon: 'refresh',
				category: 'actions.project.name',
			})
		)
	)

	projectActions.push(
		ActionManager.addAction(
			new Action({
				id: 'project.reloadExtensions',
				async trigger() {
					await Extensions.reload()
				},
				name: 'actions.project.reloadExtensions.name',
				description: 'actions.project.reloadExtensions.description',
				icon: 'frame_reload',
				category: 'actions.project.name',
			})
		)
	)

	projectActions.push(
		ActionManager.addAction(
			new Action({
				id: 'project.toggleFileExplorer',
				async trigger() {
					FileExplorer.toggle()
				},
				name: 'actions.project.toggleFileExplorer.name',
				description: 'actions.project.toggleFileExplorer.description',
				icon: 'folder_open',
				category: 'actions.project.name',
			})
		)
	)

	ActionManager.addAction(
		new Action({
			id: 'project.newProject',
			trigger() {
				Windows.open(CreateProjectWindow)
			},
			name: 'actions.project.newProject.name',
			description: 'actions.project.newProject.description',
			icon: 'add',
			category: 'actions.project.name',
		})
	)

	ProjectManager.updatedCurrentProject.on(() => {
		for (const action of projectActions) {
			action.setVisible(ProjectManager.currentProject !== null)
		}
	})
}

function setupTextEditorActions() {
	const copy = ActionManager.addAction(
		new Action({
			id: 'textEditor.copy',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.copy()
			},
			keyBinding: 'Ctrl + C',
			name: 'actions.textEditor.copy.name',
			description: 'actions.textEditor.copy.description',
			icon: 'content_copy',
			visible: false,
			category: 'actions.textEditor.name',
		})
	)

	const paste = ActionManager.addAction(
		new Action({
			id: 'textEditor.paste',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.paste()
			},
			keyBinding: 'Ctrl + V',
			name: 'actions.textEditor.paste.name',
			description: 'actions.textEditor.paste.description',
			icon: 'content_paste',
			visible: false,
			category: 'actions.textEditor.name',
		})
	)

	const cut = ActionManager.addAction(
		new Action({
			id: 'textEditor.cut',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.cut()
			},
			keyBinding: 'Ctrl + X',
			name: 'actions.textEditor.cut.name',
			description: 'actions.textEditor.cut.description',
			icon: 'content_cut',
			visible: false,
			category: 'actions.textEditor.name',
		})
	)

	const format = ActionManager.addAction(
		new Action({
			id: 'textEditor.format',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.format()
			},
			name: 'actions.textEditor.formatDocument.name',
			description: 'actions.textEditor.formatDocument.description',
			icon: 'edit_document',
			category: 'actions.textEditor.name',
		})
	)

	const goToSymbol = ActionManager.addAction(
		new Action({
			id: 'textEditor.goToSymbol',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.goToSymbol()
			},
			name: 'actions.textEditor.goToSymbol.name',
			description: 'actions.textEditor.goToSymbol.description',
			icon: 'arrow_forward',
			category: 'actions.textEditor.name',
		})
	)

	const changeAllOccurrences = ActionManager.addAction(
		new Action({
			id: 'textEditor.changeAllOccurrences',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.changeAllOccurrences()
			},
			name: 'actions.textEditor.changeAllOccurrences.name',
			description: 'actions.textEditor.changeAllOccurrences.description',
			icon: 'edit_note',
			category: 'actions.textEditor.name',
		})
	)

	const goToDefinition = ActionManager.addAction(
		new Action({
			id: 'textEditor.goToDefinition',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.goToDefinition()
			},
			name: 'actions.textEditor.goToDefinition.name',
			description: 'actions.textEditor.goToDefinition.description',
			icon: 'search',
			category: 'actions.textEditor.name',
		})
	)

	const viewDocumentation = ActionManager.addAction(
		new Action({
			id: 'textEditor.viewDocumentation',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TextTab)) return

				focusedTab.viewDocumentation()
			},
			name: 'actions.textEditor.documentationLookup.name',
			description: 'actions.textEditor.documentationLookup.description',
			icon: 'menu_book',
			category: 'actions.textEditor.name',
		})
	)

	for (const action of [copy, paste, cut, format, goToSymbol, changeAllOccurrences, goToDefinition, viewDocumentation]) {
		TabManager.focusedTabSystemChanged.on(() => {
			TabManager.focusedTabSystemChanged.on(() => {
				action.setVisible(
					TabManager.focusedTabSystem.value !== null &&
						TabManager.focusedTabSystem.value.selectedTab.value !== null &&
						TabManager.focusedTabSystem.value.selectedTab.value instanceof TextTab
				)
			})
		})
	}
}

function setupFileSystemActions() {
	const deleteFileSystemEntry = ActionManager.addAction(
		new Action({
			id: 'files.deleteFileSystemEntry',
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
			keyBinding: 'Delete',
			name: 'actions.files.delete.name',
			description: 'actions.files.delete.description',
			icon: 'delete',
			requiresContext: true,
			visible: false,
			category: 'actions.files.name',
		})
	)

	const createFile = ActionManager.addAction(
		new Action({
			id: 'files.createFile',
			trigger: async (path: unknown) => {
				if (typeof path !== 'string') return

				Windows.open(
					new PromptWindow('Create File', 'File Name', 'File Name', (name) => {
						fileSystem.writeFile(join(path, name), '')
					})
				)
			},
			name: 'actions.files.createFile.name',
			description: 'actions.files.createFile.description',
			icon: 'note_add',
			requiresContext: true,
			visible: false,
			category: 'actions.files.name',
		})
	)

	const createFolder = ActionManager.addAction(
		new Action({
			id: 'files.createFolder',
			trigger: async (path: unknown) => {
				if (typeof path !== 'string') return

				Windows.open(
					new PromptWindow('Create Folder', 'Folder Name', 'Folder Name', (name) => {
						fileSystem.makeDirectory(join(path, name))
					})
				)
			},
			name: 'actions.files.createFolder.name',
			description: 'actions.files.createFolder.description',
			icon: 'create_new_folder',
			requiresContext: true,
			visible: false,
			category: 'actions.files.name',
		})
	)

	const renameFileSystemEntry = ActionManager.addAction(
		new Action({
			id: 'files.renameFileSystemEntry',
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
			name: 'actions.files.rename.name',
			description: 'actions.files.rename.description',
			icon: 'text_fields_alt',
			requiresContext: true,
			visible: false,
			category: 'actions.files.name',
		})
	)

	const duplicateFileSystemEntry = ActionManager.addAction(
		new Action({
			id: 'files.duplicateFileSystemEntry',
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
			name: 'actions.files.duplicate.name',
			description: 'actions.files.duplicate.description',
			icon: 'file_copy',
			requiresContext: true,
			visible: false,
			category: 'actions.files.name',
		})
	)

	const copyFileSystemEntry = ActionManager.addAction(
		new Action({
			id: 'files.copyFileSystemEntry',
			trigger: async (path: unknown) => {
				if (typeof path !== 'string') return

				if (!(await fileSystem.exists(path))) return

				setClipboard(await fileSystem.getEntry(path))
			},
			keyBinding: 'Ctrl + C',
			name: 'actions.files.copy.name',
			description: 'actions.files.copy.description',
			icon: 'file_copy',
			requiresContext: true,
			visible: false,
			category: 'actions.files.name',
		})
	)

	const pasteFileSystemEntry = ActionManager.addAction(
		new Action({
			id: 'files.pasteFileSystemEntry',
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
			keyBinding: 'Ctrl + V',
			name: 'actions.files.paste.name',
			description: 'actions.files.paste.description',
			icon: 'content_paste',
			requiresContext: true,
			visible: false,
			category: 'actions.files.name',
		})
	)

	const openToSide = ActionManager.addAction(
		new Action({
			id: 'files.openToSide',
			trigger: async (path: unknown) => {
				if (typeof path !== 'string') return

				if (TabManager.isFileOpen(path)) return

				const tabSystem = await TabManager.addTabSystem()

				TabManager.focusTabSystem(tabSystem)

				await TabManager.openFile(path)
			},
			name: 'actions.files.openToSide.name',
			description: 'actions.files.openToSide.description',
			icon: 'splitscreen_right',
			requiresContext: true,
			visible: false,
			category: 'actions.files.name',
		})
	)

	for (const action of [
		deleteFileSystemEntry,
		createFile,
		createFolder,
		renameFileSystemEntry,
		duplicateFileSystemEntry,
		copyFileSystemEntry,
		pasteFileSystemEntry,
	]) {
		ProjectManager.updatedCurrentProject.on(() => {
			action.setVisible(ProjectManager.currentProject !== null)
		})
	}
}

function setupExportActions() {
	const exportBrProject = ActionManager.addAction(
		new Action({
			id: 'export.exportBrProject',
			trigger: () => {
				exportAsBrProject()
			},
			name: 'actions.export.brproject.name',
			description: 'actions.export.brproject.description',
			icon: 'folder_zip',
			visible: false,
			category: 'actions.export.name',
		})
	)

	const exportMcAddon = ActionManager.addAction(
		new Action({
			id: 'export.exportMcAddon',
			trigger: () => {
				exportAsMcAddon()
			},
			name: 'actions.export.mcaddon.name',
			description: 'actions.export.mcaddon.description',
			icon: 'deployed_code',
			visible: false,
			category: 'actions.export.name',
		})
	)

	const exportMcWorld = ActionManager.addAction(
		new Action({
			id: 'export.exportMcWorld',
			trigger: () => {
				exportAsTemplate(true)
			},
			name: 'actions.export.mcworld.name',
			description: 'actions.export.mcworld.description',
			icon: 'globe',
			visible: false,
			category: 'actions.export.name',
		})
	)

	const exportMcTemplate = ActionManager.addAction(
		new Action({
			id: 'export.exportMcTemplate',
			trigger: () => {
				exportAsTemplate()
			},
			name: 'actions.export.mctemplate.name',
			description: 'actions.export.mctemplate.description',
			icon: 'package',
			visible: false,
			category: 'actions.export.name',
		})
	)

	for (const action of [exportBrProject, exportMcAddon, exportMcWorld, exportMcTemplate]) {
		ProjectManager.updatedCurrentProject.on(() => {
			action.setVisible(ProjectManager.currentProject !== null)
		})
	}
}

function setupJsonTreeActions() {
	const undo = ActionManager.addAction(
		new Action({
			id: 'treeEditor.undo',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TreeEditorTab)) return

				focusedTab.undo()
			},
			keyBinding: 'Ctrl + Z',
			name: 'actions.treeEditor.undo.name',
			description: 'actions.treeEditor.undo.description',
			icon: 'undo',
			visible: false,
			category: 'actions.treeEditor.name',
		})
	)

	const redo = ActionManager.addAction(
		new Action({
			id: 'treeEditor.redo',
			trigger: () => {
				const focusedTab = TabManager.getFocusedTab()

				if (focusedTab === null) return

				if (!(focusedTab instanceof TreeEditorTab)) return

				focusedTab.redo()
			},
			keyBinding: 'Ctrl + Y',
			name: 'actions.treeEditor.redo.name',
			description: 'actions.treeEditor.redo.description',
			icon: 'redo',
			visible: false,
			category: 'actions.treeEditor.name',
		})
	)

	// const copy = ActionManager.addAction(
	// 	new Action({
	// 		id: 'treeEditor.copy',
	// 		trigger: () => {
	// 			const focusedTab = TabManager.getFocusedTab()

	// 			if (focusedTab === null) return

	// 			if (!(focusedTab instanceof TreeEditorTab)) return

	// 			focusedTab.copy()
	// 		},
	// 		keyBinding: 'Ctrl + C',
	// 		name: 'actions.treeEditor.copy.name',
	// 		description: 'actions.treeEditor.copy.description',
	// 		icon: 'content_copy',
	// 		visible: false,
	// 		category: 'actions.treeEditor.name',
	// 	})
	// )

	// const paste = ActionManager.addAction(
	// 	new Action({
	// 		id: 'treeEditor.paste',
	// 		trigger: () => {
	// 			const focusedTab = TabManager.getFocusedTab()

	// 			if (focusedTab === null) return

	// 			if (!(focusedTab instanceof TreeEditorTab)) return

	// 			focusedTab.paste()
	// 		},
	// 		keyBinding: 'Ctrl + V',
	// 		name: 'actions.treeEditor.paste.name',
	// 		description: 'actions.treeEditor.paste.description',
	// 		icon: 'content_paste',
	// 		visible: false,
	// 		category: 'actions.treeEditor.name',
	// 	})
	// )

	// const cut = ActionManager.addAction(
	// 	new Action({
	// 		id: 'treeEditor.cut',
	// 		trigger: () => {
	// 			const focusedTab = TabManager.getFocusedTab()

	// 			if (focusedTab === null) return

	// 			if (!(focusedTab instanceof TreeEditorTab)) return

	// 			focusedTab.cut()
	// 		},
	// 		keyBinding: 'Ctrl + X',
	// 		name: 'actions.treeEditor.cut.name',
	// 		description: 'actions.treeEditor.cut.description',
	// 		icon: 'content_cut',
	// 		visible: false,
	// 		category: 'actions.treeEditor.name',
	// 	})
	// )

	const deleteAction = ActionManager.addAction(
		new Action({
			id: 'treeEditor.delete',
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
			name: 'actions.treeEditor.delete.name',
			description: 'actions.treeEditor.delete.description',
			icon: 'delete',
			visible: false,
			category: 'actions.treeEditor.name',
		})
	)

	// const viewDocumentation = ActionManager.addAction(
	// 	new Action({
	// 		id: 'treeEditor.viewDocumentation',
	// 		trigger: () => {
	// 			const focusedTab = TabManager.getFocusedTab()

	// 			if (focusedTab === null) return

	// 			if (!(focusedTab instanceof TextTab)) return

	// 			focusedTab.viewDocumentation()
	// 		},
	// 		name: 'actions.treeEditor.documentationLookup.name',
	// 		description: 'actions.treeEditor.documentationLookup.description',
	// 		icon: 'menu_book',
	// 		category: 'actions.treeEditor.name',
	// 	})
	// )

	const convertToObject = ActionManager.addAction(
		new Action({
			id: 'treeEditor.convertToObject',
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
			name: 'actions.treeEditor.convertToObject.name',
			description: 'actions.treeEditor.convertToObject.description',
			icon: 'swap_horiz',
			visible: false,
			category: 'actions.treeEditor.name',
		})
	)

	const convertToArray = ActionManager.addAction(
		new Action({
			id: 'treeEditor.convertToArray',
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
			name: 'actions.treeEditor.convertToArray.name',
			description: 'actions.treeEditor.convertToArray.description',
			icon: 'swap_horiz',
			visible: false,
			category: 'actions.treeEditor.name',
		})
	)

	const convertToNull = ActionManager.addAction(
		new Action({
			id: 'treeEditor.convertToNull',
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
			name: 'actions.treeEditor.convertToNull.name',
			description: 'actions.treeEditor.convertToNull.description',
			icon: 'swap_horiz',
			visible: false,
			category: 'actions.treeEditor.name',
		})
	)

	const convertToNumber = ActionManager.addAction(
		new Action({
			id: 'treeEditor.convertToNumber',
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
			name: 'actions.treeEditor.convertToNumber.name',
			description: 'actions.treeEditor.convertToNumber.description',
			icon: 'swap_horiz',
			visible: false,
			category: 'actions.treeEditor.name',
		})
	)

	const convertToString = ActionManager.addAction(
		new Action({
			id: 'treeEditor.convertToString',
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
			name: 'actions.treeEditor.convertToString.name',
			description: 'actions.treeEditor.convertToString.description',
			icon: 'swap_horiz',
			visible: false,
			category: 'actions.treeEditor.name',
		})
	)

	const convertToBoolean = ActionManager.addAction(
		new Action({
			id: 'treeEditor.convertToBoolean',
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
			name: 'actions.treeEditor.convertToBoolean.name',
			description: 'actions.treeEditor.convertToBoolean.description',
			icon: 'swap_horiz',
			visible: false,
			category: 'actions.treeEditor.name',
		})
	)

	for (const action of [
		undo,
		redo,
		deleteAction,
		convertToObject,
		convertToArray,
		convertToNull,
		convertToNumber,
		convertToString,
		convertToBoolean,
	]) {
		TabManager.focusedTabSystemChanged.on(() => {
			action.setVisible(
				TabManager.focusedTabSystem.value !== null &&
					TabManager.focusedTabSystem.value.selectedTab.value !== null &&
					TabManager.focusedTabSystem.value.selectedTab.value instanceof TreeEditorTab
			)
		})
	}
}

function setupHelpActions() {
	ActionManager.addAction(
		new Action({
			id: 'help.gettingStarted',
			trigger() {
				openUrl('https://bridge-core.app/guide/')
			},
			name: 'actions.help.gettingStarted.name',
			description: 'actions.help.gettingStarted.description',
			icon: 'flag',
			category: 'actions.help.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'help.faq',
			trigger() {
				openUrl('https://bridge-core.app/guide/faq/')
			},
			name: 'actions.help.faq.name',
			description: 'actions.help.faq.description',
			icon: 'info',
			category: 'actions.help.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'help.openDownloadGuide',
			trigger() {
				openUrl('https://bridge-core.app/guide/download/')
			},
			name: 'actions.help.download.name',
			description: 'actions.help.download.description',
			icon: 'download',
			category: 'actions.help.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'help.extensions',
			trigger() {
				openUrl('https://bridge-core.app/extensions/')
			},
			name: 'actions.help.extensions.name',
			description: 'actions.help.extensions.description',
			icon: 'code',
			category: 'actions.help.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'help.scriptingDocs',
			trigger() {
				openUrl('https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/')
			},
			name: 'actions.help.scriptingDocs.name',
			description: 'actions.help.scriptingDocs.description',
			icon: 'data_array',
			category: 'actions.help.name',
			keyBinding: 'Ctrl + Alt + S',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'help.bedrockDevDocs',
			trigger() {
				openUrl('https://bedrock.dev/')
			},
			name: 'actions.help.bedrockDevDocs.name',
			description: 'actions.help.bedrockDevDocs.description',
			icon: 'info',
			category: 'actions.help.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'help.creatorDocs',
			trigger() {
				openUrl('https://learn.microsoft.com/en-us/minecraft/creator/')
			},
			name: 'actions.help.creatorDocs.name',
			description: 'actions.help.creatorDocs.description',
			icon: 'help',
			category: 'actions.help.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'help.feedback',
			trigger() {
				openUrl('https://github.com/bridge-core/editor/issues')
			},
			name: 'actions.help.feedback.name',
			description: 'actions.help.feedback.description',
			icon: 'chat_bubble',
			category: 'actions.help.name',
		})
	)

	ActionManager.addAction(
		new Action({
			id: 'help.releases',
			trigger() {
				openUrl('https://github.com/bridge-core/editor/releases')
			},
			name: 'actions.help.releases.name',
			description: 'actions.help.releases.description',
			icon: 'publish',
			category: 'actions.help.name',
		})
	)
}
