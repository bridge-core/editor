import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'

export function setupToolsCategory(app: App) {
	const tools = new ToolbarCategory(
		'mdi-wrench-outline',
		'toolbar.tools.name'
	)

	tools.addItem(
		app.actionManager.create({
			icon: 'mdi-book-open-page-variant',
			name: 'actions.docs.name',
			description: 'actions.docs.description',
			onTrigger: () =>
				App.createNativeWindow('https://bedrock.dev', 'DocWindow'),
		})
	)
	tools.addItem(
		app.actionManager.create({
			id: 'bridge.action.refreshProject',
			icon: 'mdi-refresh',
			name: 'windows.packExplorer.refresh.name',
			description: 'windows.packExplorer.refresh.description',
			keyBinding: 'Ctrl + Meta + R',
			onTrigger: async () => {
				const app = await App.getApp()
				await app.project.refresh()
			},
		})
	)
	tools.addItem(
		app.actionManager.create({
			icon: 'mdi-reload',
			name: 'actions.reloadAutoCompletions.name',
			description: 'actions.reloadAutoCompletions.description',
			keyBinding: 'Ctrl + Shift + R',
			onTrigger: () => app.project.jsonDefaults.reload(),
		})
	)

	App.toolbar.addCategory(tools)
}
