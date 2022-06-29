import type { IStartAction } from '../Manager'
import { SidebarState, toggle } from '../../Sidebar/state'

export const setSidebarState: IStartAction = {
	type: 'raw',
	name: 'setSidebarState',
	onTrigger: async (value: string) => {
		if (value === 'hidden') {
			toggle(null)
			SidebarState.forcedInitialState = true
		}
	},
}
