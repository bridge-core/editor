import { App } from '/@/App'
import { ToolbarCategory } from '../ToolbarCategory'

export function setupHelpCategory(app: App) {
	const help = new ToolbarCategory('mdi-help', 'toolbar.help.name')
	help.addItem(
		app.actionManager.create({
			name: 'actions.releases.name',
			icon: 'mdi-alert-decagram',
			description: 'actions.releases.description',
			onTrigger: () =>
				window.open(
					'https://github.com/bridge-core/editor/releases',
					'_blank'
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'actions.bugReports.name',
			icon: 'mdi-bug-outline',
			description: 'actions.bugReports.description',
			onTrigger: () =>
				window.open(
					'https://github.com/bridge-core/editor/issues/new/choose',
					'_blank'
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'actions.pluginAPI.name',
			icon: 'mdi-puzzle-outline',
			description: 'actions.pluginAPI.description',
			onTrigger: () =>
				App.createNativeWindow(
					'https://bridge-core.github.io/plugin-docs/',
					'_blank'
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'actions.gettingStarted.name',
			icon: 'mdi-help-circle-outline',
			description: 'actions.gettingStarted.description',
			onTrigger: () =>
				App.createNativeWindow(
					'https://bridge-core.github.io/editor-docs/getting-started/',
					'_blank'
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'actions.faq.name',
			icon: 'mdi-frequently-asked-questions',
			description: 'actions.faq.description',
			onTrigger: () =>
				App.createNativeWindow(
					'https://bridge-core.github.io/editor-docs/faq/',
					'_blank'
				),
		})
	)

	App.toolbar.addCategory(help)
}
