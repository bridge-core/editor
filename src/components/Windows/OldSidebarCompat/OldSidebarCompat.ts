import { ISidebar } from '@/components/Sidebar/Common/create'
import { createWindow } from '../create'
import OldSidebarCompat from './OldSidebarCompat.vue'

export function createOldSidebarCompatWindow(sidebar: ISidebar) {
	const window = createWindow(OldSidebarCompat, {
		sidebar,
	})
	window.open()
	return window
}
