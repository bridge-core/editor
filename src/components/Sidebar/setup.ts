import { createSidebar, SidebarInstance } from './Common/create'
import Documentation from './Content/Documentation.vue'
import FileExplorer from './Content/Explorer/Main.vue'
import Extensions from './Content/Extensions/Main.vue'

let defaultSidebar: SidebarInstance
export function getDefaultSidebar() {
	return defaultSidebar
}

export function setupSidebar() {
	defaultSidebar = createSidebar({
		id: 'bpExplorer',
		displayName: 'sidebar.explorer.name',
		icon: 'mdi-folder',
		component: FileExplorer,
	}).select()

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
