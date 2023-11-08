import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'
import { Divider } from '../Divider'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { createVirtualProjectWindow } from '/@/components/FileSystem/Virtual/ProjectWindow'
import { importNewProject } from '/@/components/Projects/Import/ImportNew'
import { revealInFileExplorer } from '/@/utils/revealInFileExplorer'
import { getBridgeFolderPath } from '/@/utils/getBridgeFolderPath'

export function setupProjectCategory(app: App) {
	const project = new ToolbarCategory(
		'mdi-view-dashboard-outline',
		'toolbar.project.name'
	)

	project.addItem(
		app.actionManager.create({
			icon: 'mdi-home-outline',
			name: 'actions.goHome.name',
			description: 'actions.goHome.description',
			isDisabled: () =>
				app.isNoProjectSelected &&
				!app.viewComMojangProject.hasComMojangProjectLoaded,
			onTrigger: async () => {
				const app = await App.getApp()
				await app.projectManager.deselectCurrentProject()

				if (!App.sidebar.elements.packExplorer.isSelected)
					App.sidebar.elements.packExplorer.click()
			},
		})
	)
	project.addItem(
		app.actionManager.create({
			icon: 'mdi-folder-open-outline',
			name: 'windows.projectChooser.title',
			description: 'windows.projectChooser.description',
			isDisabled: () => app.hasNoProjects,
			onTrigger: () => {
				if (
					!import.meta.env.VITE_IS_TAURI_APP &&
					isUsingFileSystemPolyfill.value
				) {
					createVirtualProjectWindow()
				} else {
					App.instance.windows.projectChooser.open()
				}
			},
		})
	)
	project.addItem(
		app.actionManager.create({
			icon: 'mdi-minecraft',
			name: 'actions.launchMinecraft.name',
			description: 'actions.launchMinecraft.description',
			keyBinding: 'F5',
			onTrigger: () => {
				App.openUrl('minecraft:', undefined, true)
			},
		})
	)
	project.addItem(new Divider())

	project.addItem(
		app.actionManager.create({
			id: 'bridge.action.newProject',
			icon: 'mdi-folder-plus-outline',
			name: 'actions.newProject.name',
			description: 'actions.newProject.description',
			onTrigger: () => app.windows.createProject.open(),
		})
	)
	project.addItem(
		app.actionManager.create({
			icon: 'mdi-import',
			name: 'actions.importBrproject.name',
			description: 'actions.importBrproject.description',
			onTrigger: () => importNewProject(),
		})
	)
	if (import.meta.env.VITE_IS_TAURI_APP) {
		project.addItem(
			app.actionManager.create({
				icon: 'mdi-folder-search-outline',
				name: 'actions.viewBridgeFolder.name',
				description: 'actions.viewBridgeFolder.description',
				onTrigger: async () => {
					revealInFileExplorer(await getBridgeFolderPath())
				},
			})
		)
	}
	project.addItem(new Divider())

	project.addItem(
		app.actionManager.create({
			icon: 'mdi-puzzle-outline',
			name: 'actions.extensions.name',
			description: 'actions.extensions.description',
			onTrigger: () => app.windows.extensionStore.open(),
		})
	)
	project.addItem(
		app.actionManager.create({
			id: 'bridge.action.openSettings',
			icon: 'mdi-cog-outline',
			name: 'actions.settings.name',
			description: 'actions.settings.description',
			keyBinding: 'Ctrl + ,',
			onTrigger: () => app.windows.settings.open(),
		})
	)

	App.toolbar.addCategory(project)
}
