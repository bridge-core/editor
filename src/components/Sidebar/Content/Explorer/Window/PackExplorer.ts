import { createWindow } from '@/components/Windows/create'
import PackExplorerComponent from './PackExplorer.vue'

export function createPackExplorer() {
	const packExplorer = createWindow(PackExplorerComponent, {
		sidebarSelection: null,
	})
	packExplorer.open()
	return packExplorer
}
