import { App } from '@/App'
import { ToolbarCategory } from '../ToolbarCategory'

export function setupFileCategory(app: App) {
	const file = new ToolbarCategory('mdi-file-outline', 'toolbar.file.name')

	file.addItem(
		app.actionManager.create({
			icon: 'mdi-file-plus-outline',
			name: 'toolbar.file.newFile',
			description: 'Create a new Add-On feature',
			keyBinding: 'Ctrl + N',
			onTrigger: () => app.windows.createPreset.open(),
		})
	)
	file.addItem(
		app.actionManager.create({
			icon: 'mdi-file-upload-outline',
			name: 'toolbar.file.openFile',
			description: 'Search and open a file from the current project',
			keyBinding: 'Ctrl + O',
			onTrigger: () => app.windows.filePicker.open(),
		})
	)
	file.addItem(
		app.actionManager.create({
			icon: 'mdi-file-download-outline',
			name: 'toolbar.file.saveFile',
			description: 'Save the currently opened file',
			keyBinding: 'Ctrl + S',
			onTrigger: () => App.ready.once(app => app.tabSystem.save()),
		})
	)
	file.addItem(
		new ToolbarCategory(
			'mdi-palette-outline',
			'toolbar.file.preferences.name'
		)
			.addItem(
				app.actionManager.create({
					icon: 'mdi-cog-outline',
					name: 'toolbar.file.preferences.settings',
					description: "Open bridge.'s app settings",
					keyBinding: 'Ctrl + ,',
					onTrigger: () => app.windows.settings.open(),
				})
			)
			.addItem(
				app.actionManager.create({
					icon: 'mdi-puzzle-outline',
					name: 'toolbar.file.preferences.extensions',
					description: 'Manage your installed extensions',
					onTrigger: () => app.windows.extensionStore.open(),
				})
			)
	)

	App.toolbar.addCategory(file)
}
