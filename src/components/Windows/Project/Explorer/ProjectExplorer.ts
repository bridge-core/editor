import { createWindow } from '@/components/Windows/create'
import ProjectExplorerComponent from './ProjectExplorer.vue'

const windowState = {
	sidebar: {
		selection: null,
	},
}

export function createProjectExplorer() {
	const projectExplorer = createWindow(ProjectExplorerComponent, windowState)
	projectExplorer.open()
	return projectExplorer
}
