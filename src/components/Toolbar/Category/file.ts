import { mainTabSystem } from '@/components/TabSystem/Main'
import { IAppMenu } from '../create'
// import CreateFileWindow from '../../../../windows/CreateFile'
// import Store from '../../../../store/index'
// import { ipcRenderer } from 'electron'
// import TabSystem from '../../../TabSystem'
// import SettingsWindow from '../../../../windows/Settings'
// import ExtensionBrowser from '../../../../windows/Extensions/Browser'
// import { ImportOBJ } from '../../Windows/Tools/ImportOBJ/definition'
// import LoadingWindow from '../../../../windows/LoadingWindow'
// import FileSystem from '../../../FileSystem'
// import { ImportFileMap } from '../../../plugins/scripts/modules/importFiles'
// import { createInformationWindow } from '../../Windows/Common/CommonDefinitions'
import { clearAllNotifications } from '../../Notifications/create'
import { App } from '@/App'

export const FileMenu: IAppMenu = {
	displayName: 'toolbar.file.name',
	displayIcon: 'mdi-file-outline',
	elements: [
		{
			displayName: 'toolbar.file.newFile',
			displayIcon: 'mdi-file-plus',
			keyBinding: {
				key: 'n',
				ctrlKey: true,
			},
			onClick: () => {
				// if (Store.state.Explorer.project.explorer)
				// 	new CreateFileWindow(undefined, false)
				// else
				// 	createInformationWindow(
				// 		'Information',
				// 		'You need to create a project before you can create files.'
				// 	)
			},
		},
		{
			displayName: 'toolbar.file.newFile',
			displayIcon: 'mdi-download',
			keyBinding: {
				key: 'o',
				ctrlKey: true,
			},
			onClick: () => {
				App.ready.once(app => app.windows.filePicker.open())
			},
		},
		{
			displayName: 'toolbar.file.import.name',
			displayIcon: 'mdi-import',
			elements: () => [
				{
					displayName: 'toolbar.file.import.openFile',
					displayIcon: 'mdi-file-upload-outline',
					// keyBinding: {
					// 	key: 'o',
					// 	ctrlKey: true,
					// },
					onClick: async () => {
						// const lw = new LoadingWindow()
						// ;(
						// 	await ipcRenderer.invoke('openFileDialog', {
						// 		properties: ['multiSelections'],
						// 	})
						// ).forEach((filePath: string) =>
						// 	FileSystem.open(filePath)
						// )
						// lw.close()
					},
				},
				{
					displayName: 'toolbar.file.import.importOBJ',
					displayIcon: 'mdi-video-3d',
					onClick: () => {
						// ImportOBJ.open()
					},
				},
				// ...ImportFileMap.values(),
			],
		},
		{
			displayName: 'toolbar.file.saveFile',
			displayIcon: 'mdi-file-download-outline',
			keyBinding: {
				key: 's',
				ctrlKey: true,
			},
			onClick: () => {
				mainTabSystem.save()
			},
		},
		{
			displayName: 'toolbar.file.saveAs',
			displayIcon: 'mdi-file-export-outline',
			keyBinding: {
				key: 's',
				shiftKey: true,
				ctrlKey: true,
			},
			onClick: () => {
				// TabSystem.saveCurrentAs()
			},
		},
		{
			displayName: 'toolbar.file.saveAll',
			displayIcon: 'mdi-file-sync-outline',
			keyBinding: {
				key: 's',
				altKey: true,
				ctrlKey: true,
			},
			onClick: () => {
				// TabSystem.saveAll()
			},
		},
		{
			displayName: 'toolbar.file.closeEditor',
			displayIcon: 'mdi-close',
			keyBinding: {
				key: 'w',
				ctrlKey: true,
			},
			onClick: () => {
				// TabSystem.closeSelected()
			},
		},
		{
			displayName: 'toolbar.file.clearAllNotifications',
			displayIcon: 'mdi-cancel',
			keyBinding: {
				key: 'b',
				ctrlKey: true,
			},
			onClick: () => {
				clearAllNotifications()
			},
		},
		{
			displayName: 'toolbar.file.preferences.name',
			displayIcon: 'mdi-tune',
			elements: [
				{
					displayName: 'toolbar.file.preferences.settings',
					displayIcon: 'mdi-cog',
					onClick: () => {
						App.instance.windows.settings.open()
					},
				},
				{
					displayName: 'toolbar.file.preferences.extensions',
					displayIcon: 'mdi-puzzle',
					onClick: () => {
						// new ExtensionBrowser()
					},
				},
			],
		},
	],
}
