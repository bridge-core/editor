import { App } from '@/App'
import { createSidebar } from './create'
import Extensions from './Content/Extensions/Main.vue'

export function setupSidebar() {
	createSidebar({
		id: 'projects',
		displayName: 'windows.projectChooser.title',
		icon: 'mdi-view-dashboard-outline',
		onClick: () => App.instance.windows.projectChooser.open(),
	})

	createSidebar({
		id: 'bpExplorer',
		displayName: 'windows.packExplorer.title',
		icon: 'mdi-folder-outline',
		onClick: async () => {
			await new Promise<void>(resolve => {
				App.ready.once(app => app.packIndexer.once(() => resolve()))
			})
			await App.instance.windows.packExplorer.open()
		},
	})

	// createSidebar({
	// 	id: 'vanillaPacks',
	// 	displayName: 'sidebar.vanillaPacks.name',
	// 	icon: 'mdi-minecraft',
	// 	component: 'VanillaPacks',
	// })
	// createSidebar({
	// 	id: 'debugLog',
	// 	displayName: 'sidebar.debugLog.name',
	// 	icon: 'mdi-console',
	// 	component: 'DebugLog',
	// })
	createSidebar({
		id: 'extensions',
		displayName: 'sidebar.extensions.name',
		icon: 'mdi-puzzle-outline',
		component: Extensions,
	})
}
