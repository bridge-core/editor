import { AppMenu } from '../create'
// import AboutWindow from '../../../../windows/About'
// import { shell } from 'electron'

export const HelpMenu: AppMenu = {
	displayName: 'Help',
	displayIcon: 'mdi-help',
	elements: [
		{
			displayName: 'About',
			displayIcon: 'mdi-information-outline',
			onClick: () => {
				// new AboutWindow()
			},
		},
		{
			displayName: 'Releases',
			displayIcon: 'mdi-alert-decagram',
			onClick: () =>
				window.open(
					'https://github.com/solvedDev/bridge./releases',
					'_blank'
				),
		},
		{
			displayName: 'Bug Reports',
			displayIcon: 'mdi-bug-outline',
			onClick: () =>
				window.open(
					'https://github.com/solvedDev/bridge./issues/new/choose',
					'_blank'
				),
		},
		{
			displayName: 'Plugin API',
			displayIcon: 'mdi-puzzle',
			onClick: () =>
				window.open(
					'https://bridge-core.github.io/plugin-docs/',
					'_blank'
				),
		},
		{
			displayName: 'Getting Started',
			displayIcon: 'mdi-help-circle-outline',
			onClick: () =>
				window.open(
					'https://bridge-core.github.io/editor-docs/getting-started/',
					'_blank'
				),
		},
		{
			displayName: 'FAQ',
			displayIcon: 'mdi-frequently-asked-questions',
			onClick: () =>
				window.open(
					'https://bridge-core.github.io/editor-docs/faq/',
					'_blank'
				),
		},
	],
}
