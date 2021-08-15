import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'
import { clearAllNotifications } from '../../Notifications/create'
import { Divider } from '../Divider'
import { platform } from '/@/utils/os'
import { AnyFileHandle } from '../../FileSystem/Types'

export function setupFileCategory(app: App) {
	const file = new ToolbarCategory('mdi-file-outline', 'toolbar.file.name')

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
	// There's no longer a pack explorer window. We should reuse the shortcut for something else...
	file.addItem(
		app.actionManager.create({
			id: 'bridge.action.openFile',
			icon: 'mdi-open-in-app',
			name: 'actions.openFile.name',
			description: 'actions.openFile.description',
			keyBinding: 'Ctrl + O',
			onTrigger: async () => {
				let fileHandles: AnyFileHandle[]
				try {
					fileHandles = await window.showOpenFilePicker({
						multiple: true,
					})
				} catch {
					return
				}

				for (const fileHandle of fileHandles) {
					if (await app.fileDropper.importFile(fileHandle)) continue

					app.project.openFile(fileHandle, { isTemporary: false })
				}
			},
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
			icon: 'mdi-file-cancel-outline',
			name: 'actions.closeFile.name',
			description: 'actions.closeFile.description',
			keyBinding: 'Ctrl + W',
			onTrigger: () => App.ready.once((app) => app.tabSystem?.close()),
		})
	)

	file.addItem(new Divider())

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
			icon: 'mdi-content-save-edit-outline',
			name: 'actions.saveAs.name',
			description: 'actions.saveAs.description',
			keyBinding: 'Ctrl + Shift + S',
			onTrigger: () => App.ready.once((app) => app.tabSystem?.saveAs()),
		})
	)
	file.addItem(
		app.actionManager.create({
			icon: 'mdi-content-save-settings-outline',
			name: 'actions.saveAll.name',
			description: 'actions.saveAll.description',
			keyBinding:
				platform() === 'win32' ? 'Ctrl + Alt + S' : 'Ctrl + Meta + S',
			onTrigger: () => App.ready.once((app) => app.tabSystem?.saveAll()),
		})
	)

	App.toolbar.addCategory(file)
}
