import { App } from '@/App'
import { ToolbarCategory } from '../ToolbarCategory'

export function setupHelpCategory(app: App) {
	const help = new ToolbarCategory('mdi-help', 'toolbar.help.name')
	help.addItem(
		app.actionManager.create({
			name: 'toolbar.help.releases',
			icon: 'mdi-alert-decagram',
			description: 'View the latest bridge. releases',
			onTrigger: () =>
				window.open(
					'https://github.com/solvedDev/bridge./releases',
					'_blank'
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'toolbar.help.bugReports',
			icon: 'mdi-bug-outline',
			description: 'Report an issue with bridge.',
			onTrigger: () =>
				window.open(
					'https://github.com/solvedDev/bridge./issues/new/choose',
					'_blank'
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'toolbar.help.pluginAPI',
			icon: 'mdi-puzzle-outline',
			description: "Read more about bridge.'s plugin API",
			onTrigger: () =>
				App.createNativeWindow(
					'https://bridge-core.github.io/plugin-docs/',
					'_blank'
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'toolbar.help.gettingStarted',
			icon: 'mdi-help-circle-outline',
			description: 'Read our guide on how to get started with bridge.',
			onTrigger: () =>
				App.createNativeWindow(
					'https://bridge-core.github.io/editor-docs/getting-started/',
					'_blank'
				),
		})
	)
	help.addItem(
		app.actionManager.create({
			name: 'toolbar.help.faq',
			icon: 'mdi-frequently-asked-questions',
			description:
				'Read through frequently asked questions about developing Add-Ons with bridge.',
			onTrigger: () =>
				App.createNativeWindow(
					'https://bridge-core.github.io/editor-docs/faq/',
					'_blank'
				),
		})
	)

	App.toolbar.addCategory(help)
}
