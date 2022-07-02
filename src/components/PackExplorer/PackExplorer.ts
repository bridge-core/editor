import { App } from '/@/App'
import { SidebarContent } from '/@/components/Sidebar/Content/SidebarContent'
import { SelectableSidebarAction } from '/@/components/Sidebar/Content/SelectableSidebarAction'
import { SidebarAction } from '/@/components/Sidebar/Content/SidebarAction'
import PackExplorerComponent from './PackExplorer.vue'
import ProjectDisplayComponent from './ProjectDisplay.vue'
import { DirectoryEntry } from './DirectoryEntry'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { markRaw, set } from '@vue/composition-api'
import { InputWindow } from '/@/components/Windows/Common/Input/InputWindow'
import { dirname, extname, join } from '/@/utils/path'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { InfoPanel } from '/@/components/InfoPanel/InfoPanel'
import { exportAsBrproject } from '/@/components/Projects/Export/AsBrproject'
import { exportAsMcaddon } from '/@/components/Projects/Export/AsMcaddon'
import {
	canExportMctemplate,
	exportAsMctemplate,
} from '/@/components/Projects/Export/AsMctemplate'
import { FindAndReplaceTab } from '/@/components/FindAndReplace/Tab'
import { ESearchType } from '/@/components/FindAndReplace/Controls/SearchTypeEnum'
import { restartWatchModeConfig } from '../Compiler/Actions/RestartWatchMode'
import { platform } from '/@/utils/os'
import { Project } from '../Projects/Project/Project'
import { DirectoryWrapper } from '../UIElements/DirectoryViewer/DirectoryView/DirectoryWrapper'
import { showFolderContextMenu } from '../UIElements/DirectoryViewer/ContextMenu/Folder'

export class PackExplorer extends SidebarContent {
	component = PackExplorerComponent
	actions: SidebarAction[] = []
	directoryEntries: Record<string, DirectoryWrapper> = {}
	topPanel: InfoPanel | undefined = undefined
	showNoProjectView = false

	constructor() {
		super()

		App.eventSystem.on('projectChanged', () => this.setup())
		App.eventSystem.on('fileAdded', () => this.refresh())

		const updateHeaderSlot = async () => {
			const app = await App.getApp()
			await app.projectManager.projectReady.fired

			if (app.mobile.isCurrentDevice() || app.isNoProjectSelected)
				this.headerSlot = undefined
			else this.headerSlot = ProjectDisplayComponent
		}

		App.getApp().then((app) => {
			updateHeaderSlot()
			this.updateTopPanel(app)

			app.mobile.change.on(() => updateHeaderSlot())
		})

		App.eventSystem.on('projectChanged', (project: Project) => {
			updateHeaderSlot()
			this.updateTopPanel(project.app)
		})

		this.headerHeight = '60px'
	}

	updateTopPanel(app: App) {
		this.topPanel =
			isUsingFileSystemPolyfill.value && !app.isNoProjectSelected
				? new InfoPanel({
						type: 'warning',
						text: 'general.fileSystemPolyfill',
						isDismissible: true,
				  })
				: undefined
	}

	async setup() {
		const app = await App.getApp()
		await app.projectManager.projectReady.fired

		this.actions = []
		// Show select bridge. folder & create project buttons
		if (app.isNoProjectSelected) {
			this.showNoProjectView = true

			return
		} else {
			this.showNoProjectView = false
		}

		this.unselectAllActions()
		for (const pack of app.project.projectData.contains ?? []) {
			const wrapper = new DirectoryWrapper(
				null,
				await app.fileSystem.getDirectoryHandle(pack.packPath),
				{
					startPath: pack.packPath,
				}
			)
			await wrapper.open()

			set(this.directoryEntries, pack.packPath, markRaw(wrapper))
		}

		this.actions =
			app.project.projectData.contains?.map(
				(pack) =>
					new SelectableSidebarAction(this, {
						id: pack.packPath,
						name: `packType.${pack.id}.name`,
						icon: pack.icon,
						color: pack.color,
					})
			) ?? []

		if (isUsingFileSystemPolyfill.value) {
			this.actions.push(
				new SidebarAction({
					icon: 'mdi-content-save-outline',
					name: 'general.save',
					onTrigger: () => exportAsBrproject(),
				})
			)
		}

		this.actions.push(
			new SidebarAction({
				icon: 'mdi-dots-vertical',
				name: 'general.more',
				onTrigger: (event) => {
					this.showMoreMenu(event)
				},
			})
		)
	}

	onContentRightClick(event: MouseEvent): void {
		const selectedId = this.selectedAction?.getConfig().id
		if (!selectedId) return

		showFolderContextMenu(event, this.directoryEntries[selectedId], {
			hideDelete: true,
			hideRename: true,
		})
	}

	async refresh() {
		await Promise.all(
			Object.values(this.directoryEntries).map((dirent) =>
				dirent.refresh()
			)
		)
	}

	async getContextMenu(
		type: 'file' | 'folder' | 'virtualFolder',
		path: string,
		entry: DirectoryEntry
	) {
		if (type === 'virtualFolder') return []
		const app = await App.getApp()
		const project = app.project

		return [
			{
				icon: 'mdi-file-search-outline',
				name: 'windows.packExplorer.fileActions.findInFolder.name',
				description:
					'windows.packExplorer.fileActions.findInFolder.description',
				onTrigger: () => {
					const config = project.app.projectConfig
					const packTypes: { [key: string]: string } = {
						BP: config.resolvePackPath('behaviorPack'),
						RP: config.resolvePackPath('resourcePack'),
						SP: config.resolvePackPath('skinPack'),
						WT: config.resolvePackPath('worldTemplate'),
					}
					let pathPackType = 'BP'
					for (const packType of Object.keys(packTypes)) {
						if (path.includes(packTypes[packType]))
							pathPackType = packType
					}
					project.tabSystem?.add(
						new FindAndReplaceTab(project.tabSystem!, {
							searchType: ESearchType.matchCase,
							includeFiles: path.replace(
								packTypes[pathPackType],
								pathPackType
							),
							excludeFiles: '',
						})
					)
				},
			},
		]
	}

	async showMoreMenu(event: MouseEvent) {
		const app = await App.getApp()

		const packPath = this.selectedAction?.getConfig()?.id

		showContextMenu(event, [
			// Add new file
			{
				icon: 'mdi-plus',
				name: 'windows.packExplorer.createPreset',
				onTrigger: async () => {
					await app.windows.createPreset.open()
				},
			},
			{ type: 'divider' },
			// Reload project
			{
				icon: 'mdi-refresh',
				name: 'windows.packExplorer.refresh.name',
				onTrigger: async () => {
					app.actionManager.trigger('bridge.action.refreshProject')
				},
			},
			// Restart dev server
			restartWatchModeConfig,
			{ type: 'divider' },

			// Export project as .brproject
			{
				icon: 'mdi-export',
				name: 'windows.packExplorer.exportAsBrproject.name',
				onTrigger: () => exportAsBrproject(),
			},
			// Export project as .mcaddon
			{
				icon: 'mdi-folder-zip-outline',
				name: 'windows.packExplorer.exportAsMcaddon.name',
				onTrigger: () => exportAsMcaddon(),
			},
			// Export project as .mcworld
			{
				icon: 'mdi-earth-box',
				name: 'windows.packExplorer.exportAsMcworld.name',
				isDisabled: !(await canExportMctemplate()),
				onTrigger: () => exportAsMctemplate(true),
			},
			// Export project as .mctemplate
			{
				icon: 'mdi-earth-box-plus',
				name: 'windows.packExplorer.exportAsMctemplate.name',
				isDisabled: !(await canExportMctemplate()),
				onTrigger: () => exportAsMctemplate(),
			},
			...(await app.project.exportProvider.getExporters()),
			{ type: 'divider' },

			// Project config
			{
				icon: 'mdi-cog-outline',
				name: 'windows.packExplorer.projectConfig.name',
				onTrigger: async () => {
					const project = app.project

					// Test whether project config exists
					if (!(await project.fileSystem.fileExists('config.json'))) {
						new InformationWindow({
							description:
								'windows.packExplorer.projectConfig.missing',
						})
						return
					}

					// Open project config
					await project.tabSystem?.openPath(
						`${project.projectPath}/config.json`
					)
				},
			},
		])
	}
}
