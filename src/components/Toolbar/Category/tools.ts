import { terminalWindow } from '@/components/Terminal/definition'
import { AppMenu } from '../create'
// import { GoToFile } from '../../Windows/Tools/GoToFile/definition'
// import SnippetWindow from '../../../../windows/Snippets'
// import PresetWindow from '../../../../windows/PresetWindow'

export const ToolMenu: AppMenu = {
	displayName: 'toolbar.tools.name',
	displayIcon: 'mdi-wrench',
	elements: [
		{
			displayName: 'toolbar.tools.terminal',
			displayIcon: 'mdi-console',
			keyBinding: {
				key: 'p',
				ctrlKey: true,
				shiftKey: true,
			},
			onClick: () => terminalWindow.open(),
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
