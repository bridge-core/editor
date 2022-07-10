import { App } from '/@/App'
import { SidebarContent } from '/@/components/Sidebar/Content/SidebarContent'
import { SelectableSidebarAction } from '/@/components/Sidebar/Content/SelectableSidebarAction'
import { SidebarAction } from '/@/components/Sidebar/Content/SidebarAction'
import PackExplorerComponent from './PackExplorer.vue'
import ProjectDisplayComponent from './ProjectDisplay.vue'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { markRaw, ref, set } from 'vue'
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
import { Project } from '../Projects/Project/Project'
import { DirectoryWrapper } from '../UIElements/DirectoryViewer/DirectoryView/DirectoryWrapper'
import { showFolderContextMenu } from '../UIElements/DirectoryViewer/ContextMenu/Folder'
import { ViewCompilerOutput } from '../UIElements/DirectoryViewer/ContextMenu/Actions/ViewCompilerOutput'

export class PackExplorer extends SidebarContent {
	component = markRaw(PackExplorerComponent)
	actions: SidebarAction[] = []
	directoryEntries = ref<Record<string, DirectoryWrapper>>({})
	topPanel: InfoPanel | undefined = undefined
	showNoProjectView = false
	headerHeight = '60px'

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
		this.actions = []
		for (const pack of app.project.projectData.contains ?? []) {
			const handle = await app.fileSystem
				.getDirectoryHandle(pack.packPath)
				.catch(() => null)
			if (!handle) continue

			const wrapper = markRaw(
				new DirectoryWrapper(null, handle, {
					startPath: pack.packPath,

					provideFileContextMenu: (fileWrapper) => [
						ViewCompilerOutput(fileWrapper.path),
					],
				})
			)
			await wrapper.open()

			set(this.directoryEntries, pack.packPath, wrapper)
			this.actions.push(
				new SelectableSidebarAction(this, {
					id: pack.packPath,
					name: `packType.${pack.id}.name`,
					icon: pack.icon,
					color: pack.color,
				})
			)
		}

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

		showFolderContextMenu(event, this.directoryEntries.value[selectedId], {
			hideDelete: true,
			hideRename: true,
			hideDuplicate: true,
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
		path: string
	) {
		if (type === 'virtualFolder') return []
		const app = await App.getApp()
		const project = app.project

		return [
			{
				icon: 'mdi-file-search-outline',
				name: 'actions.findInFolder.name',
				description: 'actions.findInFolder.description',
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
			{
				type: 'submenu',
				icon: 'mdi-export',
				name: 'windows.packExplorer.exportAs.name',
				actions: [
					// Export project as .brproject
					{
						icon: 'mdi-folder-zip-outline',
						name: 'windows.packExplorer.exportAs.brproject',
						onTrigger: () => exportAsBrproject(),
					},
					// Export project as .mcaddon
					{
						icon: 'mdi-minecraft',
						name: 'windows.packExplorer.exportAs.mcaddon',
						onTrigger: () => exportAsMcaddon(),
					},
					// Export project as .mcworld
					{
						icon: 'mdi-earth-box',
						name: 'windows.packExplorer.exportAs.mcworld',
						isDisabled: !(await canExportMctemplate()),
						onTrigger: () => exportAsMctemplate(true),
					},
					// Export project as .mctemplate
					{
						icon: 'mdi-earth-box-plus',
						name: 'windows.packExplorer.exportAs.mctemplate',
						isDisabled: !(await canExportMctemplate()),
						onTrigger: () => exportAsMctemplate(),
					},
					...(await app.project.exportProvider.getExporters()),
				],
			},

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
			{
				icon: 'mdi-folder-open-outline',
				name: 'windows.packExplorer.openProjectFolder.name',
				onTrigger: async () => {
					app.viewFolders.addDirectoryHandle({
						directoryHandle: app.project.baseDirectory,
					})
				},
			},
		])
	}
}
