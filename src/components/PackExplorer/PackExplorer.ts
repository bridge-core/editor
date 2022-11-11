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
import { searchType } from '../FindAndReplace/Controls/searchType'
import { restartWatchModeConfig } from '../Compiler/Actions/RestartWatchMode'
import { DirectoryWrapper } from '../UIElements/DirectoryViewer/DirectoryView/DirectoryWrapper'
import { showFolderContextMenu } from '../UIElements/DirectoryViewer/ContextMenu/Folder'
import { IHandleMovedOptions } from '../UIElements/DirectoryViewer/DirectoryStore'
import { ViewConnectedFiles } from '../UIElements/DirectoryViewer/ContextMenu/Actions/ConnectedFiles'
import { ToLocalProjectAction } from './Actions/ToLocalProject'
import { ToBridgeFolderProjectAction } from './Actions/ToBridgeFolderProject'

export class PackExplorer extends SidebarContent {
	component = markRaw(PackExplorerComponent)
	actions: SidebarAction[] = []
	directoryEntries: Record<string, DirectoryWrapper> = {}
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

			app.mobile.change.on(() => updateHeaderSlot())
		})

		App.eventSystem.on('projectChanged', () => {
			updateHeaderSlot()
		})
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

					provideFileContextMenu: async (fileWrapper) => [
						await ViewConnectedFiles(fileWrapper),
					],
					provideFileDiagnostics: async (fileWrapper) => {
						const packIndexer = app.project.packIndexer
						await packIndexer.fired

						const filePath = fileWrapper.path
						if (!filePath) return []

						return packIndexer.service.getFileDiagnostics(filePath)
					},
					onHandleMoved: (opts) => this.onHandleMoved(opts),
					onFilesAdded: (filePaths) => this.onFilesAdded(filePaths),
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

	async onHandleMoved({
		fromPath,
		toPath,
		movedHandle,
	}: IHandleMovedOptions) {
		const app = await App.getApp()
		if (movedHandle.kind === 'file')
			await app.project.onMovedFile(fromPath, toPath)
		else await app.project.onMovedFolder(fromPath, toPath)
	}
	async onFilesAdded(filePaths: string[]) {
		const app = await App.getApp()

		await app.project.updateFiles(filePaths)
	}

	onContentRightClick(event: MouseEvent): void {
		const selectedId = this.selectedAction?.getConfig().id
		if (!selectedId) return

		showFolderContextMenu(event, this.directoryEntries[selectedId], {
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
					project.tabSystem?.add(
						new FindAndReplaceTab(project.tabSystem!, undefined, {
							searchType: searchType.matchCase,
						})
					)
				},
			},
		]
	}

	async showMoreMenu(event: MouseEvent) {
		const app = await App.getApp()

		const moveAction = app.project.isLocal
			? ToBridgeFolderProjectAction(app.project)
			: ToLocalProjectAction(app.project)

		showContextMenu(event, [
			// Add new file
			{
				icon: 'mdi-plus',
				name: 'packExplorer.createPreset',
				onTrigger: async () => {
					await app.windows.createPreset.open()
				},
			},

			isUsingFileSystemPolyfill.value ? null : moveAction,
			{ type: 'divider' },
			// Reload project
			{
				icon: 'mdi-refresh',
				name: 'packExplorer.refresh.name',
				onTrigger: async () => {
					app.actionManager.trigger('bridge.action.refreshProject')
				},
			},
			// Restart dev server
			restartWatchModeConfig(false),
			{ type: 'divider' },
			{
				type: 'submenu',
				icon: 'mdi-export',
				name: 'packExplorer.exportAs.name',
				actions: [
					// Export project as .brproject
					{
						icon: 'mdi-folder-zip-outline',
						name: 'packExplorer.exportAs.brproject',
						onTrigger: () => exportAsBrproject(),
					},
					// Export project as .mcaddon
					{
						icon: 'mdi-minecraft',
						name: 'packExplorer.exportAs.mcaddon',
						onTrigger: () => exportAsMcaddon(),
					},
					// Export project as .mcworld
					{
						icon: 'mdi-earth-box',
						name: 'packExplorer.exportAs.mcworld',
						isDisabled: !(await canExportMctemplate()),
						onTrigger: () => exportAsMctemplate(true),
					},
					// Export project as .mctemplate
					{
						icon: 'mdi-earth-box-plus',
						name: 'packExplorer.exportAs.mctemplate',
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
				name: 'packExplorer.projectConfig.name',
				onTrigger: async () => {
					const project = app.project

					// Test whether project config exists
					if (!(await project.fileSystem.fileExists('config.json'))) {
						new InformationWindow({
							description: 'packExplorer.projectConfig.missing',
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
				name: 'packExplorer.openProjectFolder.name',
				onTrigger: async () => {
					app.viewFolders.addDirectoryHandle({
						directoryHandle: app.project.baseDirectory,
						startPath: app.project.projectPath,

						onHandleMoved: (options) => this.onHandleMoved(options),
						onFilesAdded: (filePaths) =>
							this.onFilesAdded(filePaths),
					})
				},
			},
		])
	}
}
