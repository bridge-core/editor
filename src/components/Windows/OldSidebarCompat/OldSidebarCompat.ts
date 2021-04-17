import { ISidebar } from '/@/components/Sidebar/create'
import OldSidebarCompat from './OldSidebarCompat.vue'
import { BaseWindow } from '../BaseWindow'

export function createOldSidebarCompatWindow(sidebar: ISidebar) {
	const window = new (class extends BaseWindow {
		protected sidebar = sidebar

		constructor() {
			super(OldSidebarCompat)
			this.defineWindow()
		}
	})()

	window.open()
	return window
}
