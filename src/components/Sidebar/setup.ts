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
			// PackIndexer needs to be done before we can open the PackExplorer
			await new Promise<void>(resolve => {
				App.ready.once(app => app.packIndexer.once(() => resolve()))
			})
			App.instance.windows.packExplorer.open()
		},
	})
	createSidebar({
		id: 'compiler',
		displayName: 'sidebar.compiler.name',
		icon: 'mdi-cogs',
		onClick: async () => {
			const app = await App.getApp()
			await app.compiler.openWindow()
		},
	})
	createSidebar({
		id: 'extensions',
		displayName: 'sidebar.extensions.name',
		icon: 'mdi-puzzle-outline',
		onClick: async () => {
			const app = await App.getApp()
			await app.windows.extensionStore.open()
		},
	})
}
