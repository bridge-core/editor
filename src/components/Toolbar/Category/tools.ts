import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'
import { Divider } from '../Divider'
import { platform } from '/@/libs/os'
import { clearAllNotifications } from '/@/components/Notifications/create'
import { IframeTab } from '/@/components/Editors/IframeTab/IframeTab'
import { BlockbenchTab } from '../../Editors/Blockbench/BlockbenchTab'

export function setupToolsCategory(app: App) {
	const tools = new ToolbarCategory(
		'mdi-wrench-outline',
		'toolbar.tools.name'
	)

	tools.disposables.push(
		App.eventSystem.on('projectChanged', () => {
			tools.shouldRender.value = !app.isNoProjectSelected
		})
	)

	tools.shouldRender.value = !app.isNoProjectSelected

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

	App.toolbar.addCategory(tools)
}
