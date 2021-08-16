import { App } from '/@/App'
import { createSidebar } from './create'
import { FindAndReplaceTab } from '/@/components/FindAndReplace/Tab'
import { SettingsWindow } from '../Windows/Settings/SettingsWindow'
import { SidebarState } from './state'
import { PackExplorer } from '/@/components/PackExplorer/PackExplorer'
import { isUsingFileSystemPolyfill } from '../FileSystem/Polyfill'
import { createVirtualProjectWindow } from '../FileSystem/Virtual/ProjectWindow'

export async function setupSidebar() {
	const app = await App.getApp()

	createSidebar({
		id: 'projects',
		displayName: 'windows.projectChooser.title',
		icon: 'mdi-view-dashboard-outline',
		onClick: async () => {
			if (isUsingFileSystemPolyfill) {
				createVirtualProjectWindow()
			} else {
				App.instance.windows.projectChooser.open()
			}
		},
	})

	const packExplorer = createSidebar({
		id: 'packExplorer',
		displayName: 'windows.packExplorer.title',
		icon: 'mdi-folder-outline',
		sidebarContent: app.packExplorer,
	})
	packExplorer.click()

	createSidebar({
		id: 'fileSearch',
		displayName: 'findAndReplace.name',
		icon: 'mdi-file-search-outline',
		onClick: async () => {
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
			await app.project?.compilerManager.openWindow()
		},
	})
	createSidebar({
		id: 'extensions',
		displayName: 'sidebar.extensions.name',
		icon: 'mdi-puzzle-outline',
		onClick: async () => {
			await app.windows.extensionStore.open()
		},
	})

	SettingsWindow.loadedSettings.once((settingsState) => {
		for (const sidebar of Object.values(SidebarState.sidebarElements)) {
			sidebar.isVisible =
				settingsState?.sidebar?.sidebarElements?.[sidebar.uuid] ?? true
		}
	})
}
