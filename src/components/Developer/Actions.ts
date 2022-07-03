import { del, set } from 'idb-keyval'
import { SimpleAction, IActionConfig } from '../Actions/SimpleAction'
import { comMojangKey } from '../FileSystem/ComMojang'
import { App } from '/@/App'

const devActionConfigs: IActionConfig[] = [
	{
		icon: 'mdi-delete',
		name: '[Dev: Reset local fs]',
		description:
			'[Reset the local fs (navigator.storage.getDirectory()) to be completely emtpy]',
		onTrigger: async () => {
			const app = await App.getApp()
			await Promise.all([
				app.fileSystem.unlink('~local/data'),
				app.fileSystem.unlink('~local/projects'),
				app.fileSystem.unlink('~local/extensions'),
			])
		},
	},
	{
		icon: 'mdi-cancel',
		name: '[Dev: Clear app data]',
		description: '[Clear data from bridge-core/editor-packages repository]',
		onTrigger: async () => {
			await set('savedAllDataInIdb', false)
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

			app.viewFolders.addDirectoryHandle(
				await navigator.storage.getDirectory(),
				'~local'
			)
		},
	},
]

export const devActions = devActionConfigs.map(
	(devActionConfig) => new SimpleAction(devActionConfig)
)
