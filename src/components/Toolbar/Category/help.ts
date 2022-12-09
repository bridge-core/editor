import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'
import { Divider } from '../Divider'

export function setupHelpCategory(app: App) {
	const help = new ToolbarCategory('mdi-help', 'toolbar.help.name')
	help.addItem(
		app.actionManager.create({
			name: 'actions.releases.name',
			icon: 'mdi-alert-decagram',
			description: 'actions.releases.description',
			onTrigger: () =>
				App.openUrl(
					'https://github.com/bridge-core/editor/releases',
					undefined,
					true
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'actions.bugReports.name',
			icon: 'mdi-bug-outline',
			description: 'actions.bugReports.description',
			onTrigger: () =>
				App.openUrl(
					'https://github.com/bridge-core/editor/issues/new/choose',
					undefined,
					true
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'actions.twitter.name',
			icon: 'mdi-twitter',
			description: 'actions.twitter.description',
			onTrigger: () =>
				App.openUrl('https://twitter.com/bridgeIDE', undefined, true),
		})
	)

	help.addItem(new Divider())

	help.addItem(
		app.actionManager.create({
			name: 'actions.extensionAPI.name',
			icon: 'mdi-puzzle-outline',
			description: 'actions.extensionAPI.description',
			onTrigger: () =>
				App.openUrl(
					'https://bridge-core.github.io/extension-docs/',
					undefined,
					true
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'actions.gettingStarted.name',
			icon: 'mdi-help-circle-outline',
			description: 'actions.gettingStarted.description',
			onTrigger: () =>
				App.openUrl(
					'https://bridge-core.github.io/editor-docs/getting-started/',
					undefined,
					true
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'actions.faq.name',
			icon: 'mdi-frequently-asked-questions',
			description: 'actions.faq.description',
			onTrigger: () =>
				App.openUrl(
					'https://bridge-core.github.io/editor-docs/faq/',
					undefined,
					true
				),
		})
	)

	App.toolbar.addCategory(help)
}
