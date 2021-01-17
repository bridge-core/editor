import { App } from '@/App'
import { IAppMenu } from '../create'
// import { GoToFile } from '../../Windows/Tools/GoToFile/definition'
// import SnippetWindow from '../../../../windows/Snippets'
// import PresetWindow from '../../../../windows/PresetWindow'

export const ToolMenu: IAppMenu = {
	displayName: 'toolbar.tools.name',
	displayIcon: 'mdi-wrench',
	elements: [
		{
			displayName: 'toolbar.tools.docs',
			displayIcon: 'mdi-book-open-page-variant',
			onClick: () =>
				App.createNativeWindow('https://bedrock.dev', 'DocWindow'),
		},
		{
			displayName: 'toolbar.tools.presets',
			displayIcon: 'mdi-text-box-multiple-outline',
			onClick: () => {
				// new PresetWindow()
			},
		},
		{
			displayName: 'toolbar.tools.snippets',
			displayIcon: 'mdi-attachment',
			keyBinding: {
				key: 'q',
				ctrlKey: true,
			},
			onClick: () => {
				// SnippetWindow.show()
			},
		},
		{
			displayName: 'toolbar.tools.goToFile',
			displayIcon: 'mdi-magnify',
			keyBinding: {
				key: 'o',
				ctrlKey: true,
				shiftKey: true,
			},
			onClick: () => {
				// GoToFile.open()
			},
		},
	],
}
