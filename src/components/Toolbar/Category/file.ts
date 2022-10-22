import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'
import { Divider } from '../Divider'
import { platform } from '/@/utils/os'
import {
	AnyDirectoryHandle,
	AnyFileHandle,
} from '/@/components/FileSystem/Types'
import {
	isUsingFileSystemPolyfill,
	isUsingOriginPrivateFs,
} from '/@/components/FileSystem/Polyfill'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { download } from '/@/components/FileSystem/saveOrDownload'
import { CommandBarState } from '../../CommandBar/State'

export function setupFileCategory(app: App) {
	const file = new ToolbarCategory('mdi-file-outline', 'toolbar.file.name')

	file.addItem(
		app.actionManager.create({
			id: 'bridge.action.newFile',
			icon: 'mdi-file-plus-outline',
			name: 'actions.newFile.name',
			description: 'actions.newFile.description',
			keyBinding: 'Ctrl + N',
			isDisabled: () => app.isNoProjectSelected,
			onTrigger: () => app.windows.createPreset.open(),
		})
	)
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
	// Doesn't make sense to show this option fs polyfill browsers
	if (!isUsingFileSystemPolyfill.value)
		file.addItem(
			app.actionManager.create({
				id: 'bridge.action.openFolder',
				icon: 'mdi-folder-open-outline',
				name: 'actions.openFolder.name',
				description: 'actions.openFolder.description',
				keyBinding: 'Ctrl + Shift + O',
				onTrigger: async () => {
					const app = await App.getApp()
					let directoryHandle: AnyDirectoryHandle
					try {
						directoryHandle = await window.showDirectoryPicker({
							multiple: false,
							mode: 'readwrite',
						})
					} catch {
						return
					}

					await app.fileDropper.importFolder(directoryHandle)
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
			onTrigger: () => (CommandBarState.isWindowOpen = true),
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

	if (isUsingFileSystemPolyfill.value || isUsingOriginPrivateFs) {
		file.addItem(
			app.actionManager.create({
				icon: 'mdi-file-download-outline',
				name: 'actions.downloadFile.name',
				description: 'actions.downloadFile.description',
				keyBinding: 'Ctrl + Shift + S',
				onTrigger: async () => {
					const app = await App.getApp()

					const currentTab = app.project.tabSystem?.selectedTab
					if (!(currentTab instanceof FileTab)) return

					const [_, compiled] =
						await app.project.compilerService.compileFile(
							currentTab.getPath(),
							await currentTab
								.getFile()
								.then(
									async (file) =>
										new Uint8Array(await file.arrayBuffer())
								)
						)

					let uint8arr: Uint8Array
					if (typeof compiled === 'string')
						uint8arr = new TextEncoder().encode(compiled)
					else if (compiled instanceof Blob)
						uint8arr = new Uint8Array(await compiled.arrayBuffer())
					else uint8arr = new Uint8Array(compiled)

					download(currentTab.name, uint8arr)
				},
			})
		)
	} else {
		file.addItem(
			app.actionManager.create({
				icon: 'mdi-content-save-edit-outline',
				name: 'actions.saveAs.name',
				description: 'actions.saveAs.description',
				keyBinding: 'Ctrl + Shift + S',
				onTrigger: () =>
					App.ready.once((app) => app.tabSystem?.saveAs()),
			})
		)
	}

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
