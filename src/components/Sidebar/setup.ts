import { App } from '/@/App'
import { createSidebar } from './create'
import { FindAndReplaceTab } from '../Editors/FindAndReplace/Tab'

export function setupSidebar() {
	createSidebar({
		id: 'projects',
		displayName: 'windows.projectChooser.title',
		icon: 'mdi-view-dashboard-outline',
		onClick: () => App.instance.windows.projectChooser.open(),
	})

	createSidebar({
		id: 'packExplorer',
		displayName: 'windows.packExplorer.title',
		icon: 'mdi-folder-outline',
		onClick: async () => {
			// PackIndexer needs to be done before we can open the PackExplorer
			const app = await App.getApp()
			await app.project?.packIndexer.fired
			app.windows.packExplorer.open()
		},
	})

	createSidebar({
		id: 'fileSearch',
		displayName: 'sidebar.fileSearch.name',
		icon: 'mdi-file-search-outline',
		onClick: async () => {
			const app = await App.getApp()
			app.project.tabSystem?.add(
				new FindAndReplaceTab(app.project.tabSystem!),
				true
			)
		},
	})

	createSidebar({
		id: 'compiler',
		displayName: 'sidebar.compiler.name',
		icon: 'mdi-cogs',
		onClick: async () => {
			const app = await App.getApp()
			await app.project?.compilerManager.openWindow()
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
