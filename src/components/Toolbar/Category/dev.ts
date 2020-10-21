import { AppMenu } from '../create'
// import { ipcRenderer } from 'electron'
// import Provider from '../../../autoCompletions/Provider'
// import { trigger } from '../../../AppCycle/EventSystem'
// import PluginLoader from '../../../plugins/PluginLoader'
// import Store from '../../../../store/index'
// import ThemeManager from '../../../editor/Themes/ThemeManager'
// import LoadingWindow from '../../../../windows/LoadingWindow'
// import { loadDependency } from '../../../AppCycle/fetchDeps'

export const DevMenu: AppMenu = {
	displayName: 'toolbar.dev.name',
	displayIcon: 'mdi-console-line',
	elements: [
		{
			displayName: 'toolbar.dev.reloadBrowserWindow',
			displayIcon: 'mdi-reload',
			keyBinding: {
				key: 'r',
				ctrlKey: true,
			},
			onClick: () => {
				// ipcRenderer.send('bridge:reloadWindow')
			},
		},
		{
			displayName: 'toolbar.dev.reloadEditorData',
			displayIcon: 'mdi-reload',
			keyBinding: {
				key: 'r',
				shiftKey: true,
				ctrlKey: true,
			},
			onClick: async () => {
				// const lw = new LoadingWindow()
				// trigger('bridge:scriptRunner.resetCaches')
				// Provider.loadAssets(
				// 	await loadDependency('auto-completions.js'),
				// 	await loadDependency('file-definitions.js')
				// )
				// ThemeManager.reloadDefaultThemes()
				// await PluginLoader.loadPlugins()
				// lw.close()
			},
		},
		{
			displayName: 'toolbar.dev.developerTools',
			displayIcon: 'mdi-console',
			keyBinding: {
				key: 'i',
				shiftKey: true,
				ctrlKey: true,
			},
			onClick: () => {
				// ipcRenderer.send('toggleDevTools')
			},
		},
	],
}
