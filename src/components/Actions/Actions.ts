import { TextTab } from '../Editors/Text/TextTab'
import { TreeTab } from '../Editors/TreeEditor/Tab'
import { clearAllNotifications } from '../Notifications/create'
import { FileTab } from '../TabSystem/FileTab'
import { fullScreenAction } from '../TabSystem/TabContextMenu/Fullscreen'
import { ViewCompilerOutput } from '../UIElements/DirectoryViewer/ContextMenu/Actions/ViewCompilerOutput'
import { App } from '/@/App'
import { platformRedoBinding } from '/@/utils/constants'
import { platform } from '/@/utils/os'

export function setupActions(app: App) {
	addViewActions(app)
	// addToolActions(app)
	addEditActions(app)
}

function addEditActions(app: App) {
	app.actionManager.create({
		icon: 'mdi-undo',
		name: 'actions.undo.name',
		description: 'actions.undo.description',
		keyBinding: 'Ctrl + Z',
		prevent: (el) => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA',
		onTrigger: () => {
			const currentTab = app.tabSystem?.selectedTab
			if (currentTab instanceof TreeTab) currentTab.treeEditor.undo()
			else if (currentTab instanceof TextTab)
				currentTab.editorInstance.trigger('toolbar', 'undo', null)
			else document.execCommand('undo')
		},
	})

	app.actionManager.create({
		icon: 'mdi-redo',
		name: 'actions.redo.name',
		description: 'actions.redo.description',
		keyBinding: platformRedoBinding,
		prevent: (el) => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA',
		onTrigger: () => {
			const currentTab = app.tabSystem?.selectedTab
			if (currentTab instanceof TreeTab) currentTab.treeEditor.redo()
			else if (currentTab instanceof TextTab)
				currentTab.editorInstance.trigger('toolbar', 'redo', null)
			else document.execCommand('redo')
		},
	})

	const blockActions = new Set<string>(['INPUT', 'TEXTAREA'])

	app.actionManager.create({
		icon: 'mdi-content-copy',
		name: 'actions.copy.name',
		description: 'actions.copy.description',
		keyBinding: 'Ctrl + C',
		prevent: (element) => {
			return blockActions.has(element.tagName)
		},
		onTrigger: () => app.tabSystem?.selectedTab?.copy(),
	})

	app.actionManager.create({
		icon: 'mdi-content-cut',
		name: 'actions.cut.name',
		description: 'actions.cut.description',
		keyBinding: 'Ctrl + X',
		prevent: (element) => {
			return blockActions.has(element.tagName)
		},
		onTrigger: () => app.tabSystem?.selectedTab?.cut(),
	})

	app.actionManager.create({
		icon: 'mdi-content-paste',
		name: 'actions.paste.name',
		description: 'actions.paste.description',
		keyBinding: 'Ctrl + V',
		prevent: (element) => {
			return blockActions.has(element.tagName)
		},
		onTrigger: () => app.tabSystem?.selectedTab?.paste(),
	})
}

function addToolActions(app: App) {
	app.actionManager.create({
		icon: 'mdi-folder-refresh-outline',
		name: 'general.reloadBridge.name',
		description: 'general.reloadBridge.description',
		keyBinding: 'Ctrl + R',
		onTrigger: () => {
			location.reload()
		},
	})

	app.actionManager.create({
		id: 'bridge.action.refreshProject',
		icon: 'mdi-folder-refresh-outline',
		name: 'packExplorer.refresh.name',
		description: 'packExplorer.refresh.description',
		keyBinding:
			platform() === 'win32' ? 'Ctrl + Alt + R' : 'Ctrl + Meta + R',
		onTrigger: async () => {
			if (app.isNoProjectSelected) return
			await app.projectManager.projectReady.fired
			await app.project.refresh()
		},
	})

	app.actionManager.create({
		icon: 'mdi-reload',
		name: 'actions.reloadAutoCompletions.name',
		description: 'actions.reloadAutoCompletions.description',
		keyBinding: 'Ctrl + Shift + R',
		onTrigger: async () => {
			if (app.isNoProjectSelected) return
			await app.projectManager.projectReady.fired
			app.project.jsonDefaults.reload()
		},
	})

	app.actionManager.create({
		icon: 'mdi-puzzle-outline',
		name: 'actions.reloadExtensions.name',
		description: 'actions.reloadExtensions.description',
		onTrigger: async () => {
			// Global extensions
			app.extensionLoader.disposeAll()
			app.extensionLoader.loadExtensions()
			if (app.isNoProjectSelected) return
			await app.projectManager.projectReady.fired
			// Local extensions
			app.project.extensionLoader.disposeAll()
			app.project.extensionLoader.loadExtensions()
		},
	})

	app.actionManager.create({
		icon: 'mdi-cancel',
		name: 'actions.clearAllNotifications.name',
		description: 'actions.clearAllNotifications.description',
		onTrigger: () => clearAllNotifications(),
	})
}

function addViewActions(app: App) {
	app.actionManager.create({
		icon: 'mdi-folder-outline',
		name: 'toolbar.view.togglePackExplorer.name',
		description: 'toolbar.view.togglePackExplorer.description',
		keyBinding: 'Ctrl + Shift + E',
		onTrigger: () => {
			App.sidebar.elements.packExplorer.click()
		},
	})

	app.actionManager.create({
		icon: 'mdi-file-search-outline',
		name: 'toolbar.view.openFileSearch.name',
		description: 'toolbar.view.openFileSearch.description',
		keyBinding: 'Ctrl + Shift + F',
		onTrigger: () => {
			App.sidebar.elements.fileSearch.click()
		},
	})

	const fullscreenAction = fullScreenAction()
	if (fullscreenAction) app.actionManager.create(fullscreenAction)

	app.actionManager.create({
		icon: 'mdi-chevron-right',
		name: 'toolbar.view.nextTab.name',
		description: 'toolbar.view.nextTab.description',
		keyBinding: platform() === 'darwin' ? 'Meta + Tab' : 'Ctrl + Tab',
		onTrigger: () => {
			if (app.tabSystem?.hasRecentTab()) {
				app.tabSystem?.selectRecentTab()
			} else {
				app.tabSystem?.selectNextTab()
			}
		},
	})

	app.actionManager.create({
		icon: 'mdi-chevron-left',
		name: 'toolbar.view.previousTab.name',
		description: 'toolbar.view.previousTab.description',
		keyBinding:
			platform() === 'darwin'
				? 'Meta + Shift + Tab'
				: 'Ctrl + Shift + Tab',
		onTrigger: () => {
			app.tabSystem?.selectPreviousTab()
		},
	})

	app.actionManager.create({
		icon: 'mdi-arrow-u-left-bottom',
		name: 'toolbar.view.cursorUndo.name',
		description: 'toolbar.view.cursorUndo.description',
		keyBinding: 'ctrl + mouseBack',
		onTrigger: async () => {
			const tabSystem = app.project.tabSystem
			if (!tabSystem) return
			// Await monacoEditor being created
			await tabSystem.fired
			tabSystem?.monacoEditor?.trigger('keybinding', 'cursorUndo', null)
		},
	})

	app.actionManager.create({
		icon: 'mdi-arrow-u-right-top',
		name: 'toolbar.view.cursorRedo.name',
		description: 'toolbar.view.cursorRedo.description',
		keyBinding: 'mouseForward',
		onTrigger: async () => {
			const tabSystem = app.project.tabSystem
			if (!tabSystem) return
			// Await monacoEditor being created
			await tabSystem.fired
			tabSystem?.monacoEditor?.trigger('keybinding', 'cursorRedo', null)
		},
	})

	app.actionManager.create(ViewCompilerOutput(undefined, true))

	app.actionManager.create({
		icon: 'mdi-puzzle-outline',
		name: 'actions.viewExtensionsFolder.name',
		description: 'actions.viewExtensionsFolder.description',
		onTrigger: async () => {
			const extensionsFolder = await app.fileSystem.getDirectoryHandle(
				'~local/extensions'
			)
			app.viewFolders.addDirectoryHandle({
				directoryHandle: extensionsFolder,
			})
		},
	})

	app.actionManager.create({
		icon: 'mdi-pencil-outline',
		name: 'actions.toggleReadOnly.name',
		description: 'actions.toggleReadOnly.description',
		onTrigger: () => {
			const currentTab = app.tabSystem?.selectedTab
			if (
				!(currentTab instanceof FileTab) ||
				currentTab.readOnlyMode === 'forced'
			)
				return
			currentTab.setReadOnly(
				currentTab.readOnlyMode === 'manual' ? 'off' : 'manual'
			)
		},
	})
}
