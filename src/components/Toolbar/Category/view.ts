import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { ViewCompilerOutput } from '../../UIElements/DirectoryViewer/ContextMenu/Actions/ViewCompilerOutput'
import { Divider } from '../Divider'

export function setupViewCategory(app: App) {
	const view = new ToolbarCategory('mdi-eye-outline', 'toolbar.view.name')

	view.addItem(
		app.actionManager.create({
			icon: 'mdi-folder-outline',
			name: 'toolbar.view.togglePackExplorer.name',
			description: 'toolbar.view.togglePackExplorer.description',
			keyBinding: 'Ctrl + Shift + E',
			onTrigger: () => {
				App.sidebar.elements.packExplorer.click()
			},
		})
	)
	view.addItem(
		app.actionManager.create({
			icon: 'mdi-file-search-outline',
			name: 'toolbar.view.openFileSearch.name',
			description: 'toolbar.view.openFileSearch.description',
			keyBinding: 'Ctrl + Shift + F',
			onTrigger: () => {
				App.sidebar.elements.fileSearch.click()
			},
		})
	)

	view.addItem(new Divider())

	view.addItem(app.actionManager.create(ViewCompilerOutput(undefined, true)))

	view.addItem(
		app.actionManager.create({
			icon: 'mdi-puzzle-outline',
			name: 'actions.viewExtensionsFolder.name',
			description: 'actions.viewExtensionsFolder.description',
			onTrigger: async () => {
				const extensionsFolder =
					await app.fileSystem.getDirectoryHandle('~local/extensions')

				app.viewFolders.addDirectoryHandle({
					directoryHandle: extensionsFolder,
				})
			},
		})
	)

	view.addItem(
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
	)

	App.toolbar.addCategory(view)
}
