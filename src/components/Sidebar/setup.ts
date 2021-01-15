import { App } from '@/App'
import { createSidebar } from './Common/create'
import Documentation from './Content/Documentation.vue'
import FileExplorer from './Content/Explorer/Main.vue'
import Extensions from './Content/Extensions/Main.vue'

export function setupSidebar() {
	createSidebar({
		id: 'projects',
		displayName: 'sidebar.projects.name',
		icon: 'mdi-view-dashboard-outline',
		onClick: () => App.instance.windows.projectChooser.open(),
	})

	createSidebar({
		id: 'bpExplorer',
		displayName: 'sidebar.explorer.name',
		icon: 'mdi-folder-outline',
		onClick: () => App.instance.windows.packExplorer.open(),
	})

	createSidebar({
		id: 'vanillaPacks',
		displayName: 'sidebar.vanillaPacks.name',
		icon: 'mdi-minecraft',
		component: 'VanillaPacks',
	})
	createSidebar({
		id: 'debugLog',
		displayName: 'sidebar.debugLog.name',
		icon: 'mdi-console',
		component: 'DebugLog',
	})
	createSidebar({
		id: 'extensions',
		displayName: 'sidebar.extensions.name',
		icon: 'mdi-puzzle',
		component: Extensions,
	})
}
