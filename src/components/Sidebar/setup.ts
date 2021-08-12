import { App } from '/@/App'
import { createSidebar } from './create'
import { FindAndReplaceTab } from '/@/components/FindAndReplace/Tab'
import { SettingsWindow } from '../Windows/Settings/SettingsWindow'
import { SidebarState } from './state'
import { PackExplorer } from '/@/components/PackExplorer/PackExplorer'
import { isUsingFileSystemPolyfill } from '../FileSystem/Polyfill'
import { InformedChoiceWindow } from '../Windows/InformedChoice/InformedChoice'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { exportAsBrproject } from '../Projects/Export/AsBrproject'
import { importFromBrproject } from '../Projects/Import/fromBrproject'
import { AnyFileHandle } from '../FileSystem/Types'

export function setupSidebar() {
	createSidebar({
		id: 'projects',
		displayName: 'windows.projectChooser.title',
		icon: 'mdi-view-dashboard-outline',
		onClick: async () => {
			if (isUsingFileSystemPolyfill) {
				// TODO: Prompt user whether to open new project or to save the current one
				const choiceWindow = new InformedChoiceWindow(
					'windows.projectChooser.title',
					{
						isPersistent: false,
					}
				)
				const actions = await choiceWindow.actionManager

				actions.create({
					icon: 'mdi-plus',
					name: 'windows.projectChooser.newProject.name',
					description:
						'windows.projectChooser.saveCurrentProject.description',
					onTrigger: async () => {
						const app = await App.getApp()
						app.windows.createProject.open()
					},
				})

				actions.create({
					icon: 'mdi-content-save-outline',
					name: 'windows.projectChooser.saveCurrentProject.name',
					description:
						'windows.projectChooser.saveCurrentProject.description',
					onTrigger: () => exportAsBrproject(),
				})

				actions.create({
					icon: 'mdi-folder-open-outline',
					name: 'windows.projectChooser.openNewProject.name',
					description:
						'windows.projectChooser.openNewProject.description',
					onTrigger: async () => {
						// Prompt user to select new project to open
						let projectHandle: AnyFileHandle
						try {
							;[projectHandle] = await window.showOpenFilePicker({
								multiple: false,
								types: [
									{
										description: 'Project',
										accept: {
											'application/zip': ['.brproject'],
										},
									},
								],
							})
						} catch {
							return
						}

						if (!projectHandle.name.endsWith('.brproject'))
							return new InformationWindow({
								description:
									'windows.projectChooser.wrongFileType',
							})

						await importFromBrproject(projectHandle)
					},
				})
			} else {
				App.instance.windows.projectChooser.open()
			}
		},
	})

	const packExplorer = createSidebar({
		id: 'packExplorer',
		displayName: 'windows.packExplorer.title',
		icon: 'mdi-folder-outline',
		sidebarContent: new PackExplorer(),
	})
	packExplorer.click()

	createSidebar({
		id: 'fileSearch',
		displayName: 'findAndReplace.name',
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

	SettingsWindow.loadedSettings.once((settingsState) => {
		for (const sidebar of Object.values(SidebarState.sidebarElements)) {
			sidebar.isVisible =
				settingsState?.sidebar?.sidebarElements?.[sidebar.uuid] ?? true
		}
	})
}
