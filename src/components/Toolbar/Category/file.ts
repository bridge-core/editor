import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'

export function setupFileCategory(app: App) {
	const file = new ToolbarCategory('mdi-file-outline', 'toolbar.file.name')

	file.addItem(
		app.actionManager.create({
			id: 'bridge.action.newProject',
			icon: 'mdi-folder-outline',
			name: 'actions.newProject.name',
			description: 'actions.newProject.description',
			onTrigger: () => app.windows.createProject.open(),
		})
	)
	file.addItem(
		app.actionManager.create({
			id: 'bridge.action.newFile',
			icon: 'mdi-file-plus-outline',
			name: 'actions.newFile.name',
			description: 'actions.newFile.description',
			keyBinding: 'Ctrl + N',
			onTrigger: () => app.windows.createPreset.open(),
		})
	)
	file.addItem(
		app.actionManager.create({
			id: 'bridge.action.openFile',
			icon: 'mdi-file-upload-outline',
			name: 'actions.openFile.name',
			description: 'actions.openFile.description',
			keyBinding: 'Ctrl + O',
			onTrigger: () => app.windows.packExplorer.open(),
		})
	)
	file.addItem(
		app.actionManager.create({
			id: 'bridge.action.searchFile',
			icon: 'mdi-magnify',
			name: 'actions.searchFile.name',
			description: 'actions.searchFile.description',
			keyBinding: 'Ctrl + P',
			onTrigger: () => app.windows.filePicker.open(),
		})
	)
	file.addItem(
		app.actionManager.create({
			icon: 'mdi-content-save-outline',
			name: 'actions.saveFile.name',
			description: 'actions.saveFile.description',
			keyBinding: 'Ctrl + S',
			onTrigger: () => App.ready.once((app) => app.tabSystem?.save()),
		})
	)
	file.addItem(
		app.actionManager.create({
			icon: 'mdi-file-cancel-outline',
			name: 'actions.closeFile.name',
			description: 'actions.closeFile.description',
			keyBinding: 'Ctrl + W',
			onTrigger: () => App.ready.once((app) => app.tabSystem?.close()),
		})
	)
	file.addItem(
		new ToolbarCategory(
			'mdi-palette-outline',
			'toolbar.file.preferences.name'
		)
			.addItem(
				app.actionManager.create({
					id: 'bridge.action.openSettings',
					icon: 'mdi-cog-outline',
					name: 'actions.settings.name',
					description: 'actions.settings.description',
					keyBinding: 'Ctrl + ,',
					onTrigger: () => app.windows.settings.open(),
				})
			)
			.addItem(
				app.actionManager.create({
					icon: 'mdi-puzzle-outline',
					name: 'actions.extensions.name',
					description: 'actions.extensions.description',
					onTrigger: () => app.windows.extensionStore.open(),
				})
			)
	)

	App.toolbar.addCategory(file)
}
