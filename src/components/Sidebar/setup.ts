import { App } from '/@/App'
import { createSidebar } from './SidebarElement'
import { FindAndReplaceTab } from '/@/components/FindAndReplace/Tab'
import { SettingsWindow } from '/@/components/Windows/Settings/SettingsWindow'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { createVirtualProjectWindow } from '/@/components/FileSystem/Virtual/ProjectWindow'
import { createCompilerSidebar } from '../Compiler/Sidebar/create'
import { exportAsMcaddon } from '../Projects/Export/AsMcaddon'

export async function setupSidebar() {
	createSidebar({
		id: 'projects',
		group: 'projectChooser',
		displayName: 'windows.projectChooser.title',
		icon: 'mdi-view-dashboard-outline',
		disabled: () =>
			App.instance.hasNoProjects &&
			App.instance.bridgeFolderSetup.hasFired,
		onClick: async () => {
			if (
				App.instance.hasNoProjects &&
				!App.instance.bridgeFolderSetup.hasFired
			) {
				const didSetup = await App.instance.setupBridgeFolder()
				if (!didSetup) return
			}

			if (isUsingFileSystemPolyfill.value) {
				createVirtualProjectWindow()
			} else {
				await App.instance.windows.projectChooser.open()
			}
		},
	})

	const packExplorer = createSidebar({
		id: 'packExplorer',
		group: 'packExplorer',
		displayName: 'packExplorer.name',
		icon: 'mdi-folder-outline',
	})

	App.getApp().then((app) => {
		packExplorer.setSidebarContent(app.packExplorer)
		packExplorer.setIsVisible(
			() => !app.viewComMojangProject.hasComMojangProjectLoaded
		)

		if (!App.sidebar.forcedInitialState.value) packExplorer.click()
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

	/**
	 * Enable one click exports of projects on mobile
	 * This should help users export projects faster
	 */
	createSidebar({
		id: 'quickExport',
		displayName: 'sidebar.quickExport.name',
		icon: 'mdi-export',
		// Only show quick export option for devices on which com.mojang syncing is not available
		defaultVisibility: isUsingFileSystemPolyfill.value,
		disabled: () => App.instance.isNoProjectSelected,

		onClick: () => {
			exportAsMcaddon()
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

	SettingsWindow.loadedSettings.once((settingsState) => {
		for (const sidebar of Object.values(App.sidebar.elements)) {
			sidebar.isVisibleSetting =
				settingsState?.sidebar?.sidebarElements?.[sidebar.uuid] ??
				sidebar.defaultVisibility
		}
	})
}
