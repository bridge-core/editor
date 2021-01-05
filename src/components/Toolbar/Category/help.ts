import { AppMenu } from '../create'
import { App } from '@/App'
// import AboutWindow from '../../../../windows/About'
// import { shell } from 'electron'

export const HelpMenu: AppMenu = {
	displayName: 'toolbar.help.name',
	displayIcon: 'mdi-help',
	elements: [
		{
			displayName: 'toolbar.help.about',
			displayIcon: 'mdi-information-outline',
			onClick: () => {
				// new AboutWindow()
			},
		},
		{
			displayName: 'toolbar.help.releases',
			displayIcon: 'mdi-alert-decagram',
			onClick: () =>
				window.open(
					'https://github.com/solvedDev/bridge./releases',
					'_blank'
				),
		},
		{
			displayName: 'toolbar.help.bugReports',
			displayIcon: 'mdi-bug-outline',
			onClick: () =>
				window.open(
					'https://github.com/solvedDev/bridge./issues/new/choose',
					'_blank'
				),
		},
		{
			displayName: 'toolbar.help.pluginAPI',
			displayIcon: 'mdi-puzzle',
			onClick: () =>
				App.createNativeWindow('https://bridge-core.github.io/plugin-docs/', '_blank')
		},
		{
			displayName: 'toolbar.help.gettingStarted',
			displayIcon: 'mdi-help-circle-outline',
			onClick: () =>
				App.createNativeWindow('https://bridge-core.github.io/editor-docs/getting-started/', '_blank')
		},
		{
			displayName: 'toolbar.help.faq',
			displayIcon: 'mdi-frequently-asked-questions',
			onClick: () =>
				App.createNativeWindow('https://bridge-core.github.io/editor-docs/faq/', '_blank')
		},
	],
}
