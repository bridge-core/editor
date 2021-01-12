import { createWindow } from '@/components/Windows/create'
import PackExplorerComponent from './PackExplorer.vue'

const windowState = {
	sidebar: {
		selection: null,
	},
}

export function createPackExplorer() {
	const packExplorer = createWindow(PackExplorerComponent, windowState)
	packExplorer.open()
	return packExplorer
}
