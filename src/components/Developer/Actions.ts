import { del, set } from 'idb-keyval'
import { SimpleAction, IActionConfig } from '../Actions/SimpleAction'
import { comMojangKey } from '/@/components/OutputFolders/ComMojang/ComMojang'
import { ConfirmationWindow } from '../Windows/Common/Confirm/ConfirmWindow'
import { App } from '/@/App'

const devActionConfigs: IActionConfig[] = [
	{
		icon: 'mdi-delete',
		name: '[Dev: Reset local fs]',
		description:
			'[Reset the local fs (navigator.storage.getDirectory()) to be completely emtpy]',
		onTrigger: async () => {
			const app = await App.getApp()

			const confirm = new ConfirmationWindow({
				description: '[Are you sure you want to reset the local fs?]',
			})
			confirm.open()
			const choice = await confirm.fired

			if (!choice) return

			await Promise.all([
				app.fileSystem.unlink('~local/data'),
				app.fileSystem.unlink('~local/projects'),
				app.fileSystem.unlink('~local/extensions'),
			])
		},
	},
	{
		icon: 'mdi-delete',
		name: "[Dev: Reset 'com.mojang' folder]",
		description: "[Remove the 'com.mojang' folder from local storage]",
		onTrigger: async () => {
			del(comMojangKey)
		},
	},
	{
		icon: 'mdi-cancel',
		name: '[Dev: Clear app data]',
		description: '[Clear data from bridge-core/editor-packages repository]',
		onTrigger: async () => {
			await del('savedDataForVersion')
		},
	},
	{
		icon: 'mdi-refresh',
		name: '[Dev: Reset initial setup]',
		description: '[Resets editor type and com.mojang selection]',
		onTrigger: async () => {
			await del('didChooseEditorType')
			await del(comMojangKey)
		},
	},
	{
		icon: 'mdi-open-in-new',
		name: '[Dev: Open local fs]',
		description: '[Open the local fs within the editor]',
		onTrigger: async () => {
			const app = await App.getApp()

			app.viewFolders.addDirectoryHandle({
				directoryHandle: await navigator.storage.getDirectory(),
				startPath: '~local',
			})
		},
	},
	{
		icon: 'mdi-database-outline',
		name: '[Dev: Open data directory]',
		description: '[Open the data directory within the editor]',
		onTrigger: async () => {
			const app = await App.getApp()

			app.viewFolders.addDirectoryHandle({
				directoryHandle: app.dataLoader.baseDirectory,
			})
		},
	},
	{
		icon: 'mdi-minecraft',
		name: '[Dev: Open com.mojang]',
		description: '[Open the com.mojang folder within the editor]',
		onTrigger: async () => {
			const app = await App.getApp()

			if (!app.comMojang.setup.hasFired) return

			app.viewFolders.addDirectoryHandle({
				directoryHandle: app.comMojang.fileSystem.baseDirectory,
			})
		},
	},
]

export const devActions = devActionConfigs.map(
	(devActionConfig) => new SimpleAction(devActionConfig)
)
