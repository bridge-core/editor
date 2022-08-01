import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'
import { Divider } from '../Divider'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { createVirtualProjectWindow } from '/@/components/FileSystem/Virtual/ProjectWindow'
import { importNewProject } from '/@/components/Projects/Import/ImportNew'
import { virtualProjectName } from '/@/components/Projects/Project/Project'

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
				app.projectManager.selectProject(virtualProjectName)

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
				if (isUsingFileSystemPolyfill.value) {
					createVirtualProjectWindow()
				} else {
					App.instance.windows.projectChooser.open()
				}
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
