import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'
import { Divider } from '../Divider'
import { platform } from '/@/utils/os'
import { clearAllNotifications } from '/@/components/Notifications/create'
import { IframeTab } from '/@/components/Editors/IframeTab/IframeTab'
import { BlockbenchTab } from '../../Editors/Blockbench/BlockbenchTab'

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
			onTrigger: async () => {
				const app = await App.getApp()
				const tabSystem = app.tabSystem

				if (!tabSystem) return

				const tab = new IframeTab(tabSystem, {
					icon: 'mdi-book-open-page-variant',
					name: 'bedrock.dev',
					url: 'https://bedrock.dev',
					iconColor: 'primary',
				})
				tabSystem.add(tab)
			},
		})
	)
	tools.addItem(
		app.actionManager.create({
			icon: 'mdi-minecraft',
			name: 'actions.minecraftDocs.name',
			description: 'actions.minecraftDocs.description',
			onTrigger: () => {
				App.openUrl(
					'https://docs.microsoft.com/en-us/minecraft/creator/'
				)
			},
		})
	)
	tools.addItem(
		app.actionManager.create({
			icon: '$blockbench',
			name: '[Open Blockbench]',
			onTrigger: async () => {
				const app = await App.getApp()
				const tabSystem = app.tabSystem

				if (!tabSystem) return

				const tab = new BlockbenchTab(tabSystem)
				tabSystem.add(tab)
			},
		})
	)
	tools.addItem(
		app.actionManager.create({
			icon: 'mdi-snowflake',
			name: '[Open Snowstorm]',
			onTrigger: async () => {
				const app = await App.getApp()
				const tabSystem = app.tabSystem

				if (!tabSystem) return

				const tab = new IframeTab(tabSystem, {
					icon: 'mdi-snowflake',
					name: 'Snowstorm',
					url: 'https://snowstorm.app/',
					iconColor: 'primary',
				})
				tabSystem.add(tab)
			},
		})
	)

	tools.addItem(new Divider())

	tools.addItem(
		app.actionManager.create({
			id: 'bridge.action.refreshProject',
			icon: 'mdi-folder-refresh-outline',
			name: 'packExplorer.refresh.name',
			description: 'packExplorer.refresh.description',
			keyBinding:
				platform() === 'win32' ? 'Ctrl + Alt + R' : 'Ctrl + Meta + R',
			onTrigger: async () => {
				await app.projectManager.projectReady.fired

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
			onTrigger: async () => {
				await app.projectManager.projectReady.fired

				app.project.jsonDefaults.reload()
			},
		})
	)
	tools.addItem(
		app.actionManager.create({
			icon: 'mdi-puzzle-outline',
			name: 'actions.reloadExtensions.name',
			description: 'actions.reloadExtensions.description',
			onTrigger: async () => {
				// Global extensions
				app.extensionLoader.disposeAll()
				app.extensionLoader.loadExtensions()

				await app.projectManager.projectReady.fired

				// Local extensions
				app.project.extensionLoader.disposeAll()
				app.project.extensionLoader.loadExtensions()
			},
		})
	)

	tools.addItem(new Divider())

	tools.addItem(
		app.actionManager.create({
			icon: 'mdi-cancel',
			name: 'actions.clearAllNotifications.name',
			description: 'actions.clearAllNotifications.description',
			onTrigger: () => clearAllNotifications(),
		})
	)

	App.toolbar.addCategory(tools)
}
