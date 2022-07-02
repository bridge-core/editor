import { App } from '/@/App'
import { createSidebar } from './create'
import { FindAndReplaceTab } from '/@/components/FindAndReplace/Tab'
import { SettingsWindow } from '/@/components/Windows/Settings/SettingsWindow'
import { SidebarState } from './state'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { createVirtualProjectWindow } from '/@/components/FileSystem/Virtual/ProjectWindow'
import { createCompilerSidebar } from '../Compiler/Sidebar/create'

export async function setupSidebar() {
	createSidebar({
		id: 'projects',
		displayName: 'windows.projectChooser.title',
		icon: 'mdi-view-dashboard-outline',
		disabled: () => App.instance.hasNoProjects,
		onClick: async () => {
			if (isUsingFileSystemPolyfill.value) {
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
	})

	App.getApp().then((app) => {
		packExplorer.setSidebarContent(app.packExplorer)
		if (!SidebarState.forcedInitialState) packExplorer.click()
	})

	createSidebar({
		id: 'fileSearch',
		displayName: 'findAndReplace.name',
		icon: 'mdi-file-search-outline',
		disabled: () => App.instance.isNoProjectSelected,
		onClick: async () => {
			const app = await App.getApp()
			app.project.tabSystem?.add(
				new FindAndReplaceTab(app.project.tabSystem!),
				true
			)
		},
	})

	createCompilerSidebar()

	createSidebar({
		id: 'extensions',
		displayName: 'sidebar.extensions.name',
		icon: 'mdi-puzzle-outline',
		onClick: async () => {
			const app = await App.getApp()
			await app.windows.extensionStore.open()
		},
	})

	SettingsWindow.loadedSettings.once((settingsState) => {
		for (const sidebar of Object.values(SidebarState.sidebarElements)) {
			sidebar.isVisibleSetting =
				settingsState?.sidebar?.sidebarElements?.[sidebar.uuid] ?? true
		}
	})
}
