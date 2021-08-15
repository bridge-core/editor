import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'
import { importFromBrproject } from '/@/components/Projects/Import/fromBrproject'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { Divider } from '../Divider'

export function setupProjectCategory(app: App) {
	const project = new ToolbarCategory(
		'mdi-view-dashboard-outline',
		'toolbar.project.name'
	)

	project.addItem(
		app.actionManager.create({
			icon: 'mdi-package-down',
			name: 'windows.projectChooser.title',
			description: 'windows.projectChooser.description',
			onTrigger: () => app.windows.projectChooser.open(),
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
			onTrigger: async () => {
				let fileHandle: AnyFileHandle
				try {
					;[fileHandle] = await window.showOpenFilePicker({
						multiple: false,
						types: [
							{
								description: 'bridge. Project',
								accept: {
									'application/zip': ['.brproject'],
								},
							},
						],
					})
				} catch {
					// User aborted selecting new project
					return
				}

				await importFromBrproject(fileHandle)
			},
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
