import type { IStartAction } from '../Manager'
import { SidebarState, toggle } from '../../Sidebar/state'
import { App } from '/@/App'

export const viewExtension: IStartAction = {
	type: 'encoded',
	name: 'viewExtension',
	onTrigger: async (value: string) => {
		const app = await App.getApp()
		app.windows.extensionStore.open(value)
	},
}
