import type { IStartAction } from '../Manager'
import { App } from '/@/App'

export const setSidebarState: IStartAction = {
	type: 'raw',
	name: 'setSidebarState',
	onTrigger: async (value: string) => {
		if (value === 'hidden') {
			App.sidebar.toggleSidebarContent(null)
			App.sidebar.forcedInitialState.value = true
		}
	},
}
