import { createSidebar, SidebarInstance } from './Common/create'
import Documentation from './Content/Documentation.vue'
import FileExplorer from './Content/Explorer/Main.vue'

let defaultSidebar: SidebarInstance
export function getDefaultSidebar() {
	return defaultSidebar
}

export function setupSidebar() {
	defaultSidebar = createSidebar({
		id: 'bpExplorer',
		displayName: 'Explorer',
		icon: 'mdi-folder',
		component: FileExplorer,
	}).select()

	createSidebar({
		id: 'vanillaPacks',
		displayName: 'Vanilla Packs',
		icon: 'mdi-minecraft',
		component: 'VanillaPacks',
	})
	createSidebar({
		id: 'documentation',
		displayName: 'Documentation',
		icon: 'mdi-book-open-page-variant',
		component: Documentation,
	})
	createSidebar({
		id: 'debugLog',
		displayName: 'Debug Log',
		icon: 'mdi-console',
		component: 'DebugLog',
	})
	createSidebar({
		id: 'extensions',
		displayName: 'Extensions',
		icon: 'mdi-puzzle',
		component: 'Extensions',
	})
}
