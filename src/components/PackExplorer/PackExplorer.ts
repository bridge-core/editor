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
import { set } from '@vue/composition-api'
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

export class PackExplorer extends SidebarContent {
	component = PackExplorerComponent
	actions: SidebarAction[] = []
	directoryEntries: Record<string, DirectoryEntry> = {}
	topPanel = isUsingFileSystemPolyfill
		? new InfoPanel({
				type: 'warning',
				text: 'general.fileSystemPolyfill',
				isDismissible: true,
		  })
		: undefined

	constructor() {
		super()

		App.eventSystem.on('projectChanged', () => this.setup())
		App.eventSystem.on('fileAdded', () => this.refresh())

		App.getApp().then((app) => {
			if (!app.mobile.isCurrentDevice())
				this.headerSlot = ProjectDisplayComponent

			app.mobile.change.on((isMobile) => {
				this.headerSlot = isMobile ? undefined : ProjectDisplayComponent
			})
		})
		this.headerHeight = '60px'
	}

	async setup() {
		const app = await App.getApp()

		this.unselectAllActions()
		for (const pack of app.project.projectData.contains ?? []) {
			set(
				this.directoryEntries,
				pack.packPath,
				await DirectoryEntry.create([pack.packPath])
			)
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

		if (isUsingFileSystemPolyfill) {
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
			...(type === 'file'
				? [
						(project.tabSystem?.tabs.length ?? 0) > 0
							? {
									icon: 'mdi-arrow-split-vertical',
									name:
										'windows.packExplorer.fileActions.openInSplitScreen.name',
									description:
										'windows.packExplorer.fileActions.openInSplitScreen.description',
									onTrigger: async () => {
										const handle = await app.fileSystem.getFileHandle(
											path
										)
										project.openFile(handle, {
											openInSplitScreen: true,
										})
									},
							  }
							: {
									icon: 'mdi-plus',
									name:
										'windows.packExplorer.fileActions.open.name',
									description:
										'windows.packExplorer.fileActions.open.description',
									onTrigger: async () => {
										const handle = await app.fileSystem.getFileHandle(
											entry.getPath()
										)
										project.openFile(handle)
									},
							  },
						{
							type: 'divider',
						},
				  ]
				: []),
			{
				icon: 'mdi-delete-outline',
				name: 'windows.packExplorer.fileActions.delete.name',
				description:
					'windows.packExplorer.fileActions.delete.description',
				onTrigger: async () => {
					const confirmWindow = new ConfirmationWindow({
						description:
							'windows.packExplorer.fileActions.delete.confirmText',
					})

					if (!(await confirmWindow.fired)) return

					entry.remove()

					await Promise.all([
						project.packIndexer.unlink(path),
						project.compilerManager.unlink(path),
					])

					await project.jsonDefaults.reload()

					try {
						await project.app.fileSystem.unlink(path)
					} catch {}

					await project.recentFiles.removeFile(path)
				},
			},

			...(type === 'file'
				? [
						{
							icon: 'mdi-pencil-outline',
							name:
								'windows.packExplorer.fileActions.rename.name',
							description:
								'windows.packExplorer.fileActions.rename.description',
							onTrigger: async () => {
								// Remove file extension from file name
								const fileName = entry.name
									.split('.')
									.slice(0, -1)
									.join('.')

								const inputWindow = new InputWindow({
									name:
										'windows.packExplorer.fileActions.rename.name',
									label: 'general.fileName',
									default: fileName,
									expandText: extname(path),
								})
								const newFileName = await inputWindow.fired
								if (!newFileName) return

								const newFilePath = join(
									dirname(path),
									newFileName
								)

								// If file with same path already exists, confirm that it's ok to overwrite it
								if (
									await project.app.fileSystem.fileExists(
										newFilePath
									)
								) {
									const confirmWindow = new ConfirmationWindow(
										{
											description:
												'general.confirmOverwriteFile',
										}
									)

									if (!(await confirmWindow.fired)) return
								}

								// Update pack indexer & compiler
								await Promise.all([
									project.packIndexer.unlink(path),
									project.compilerManager.unlink(path),
								])

								// The rename action needs to happen after deleting the old file inside of the output directory
								// because the compiler will fail to unlink it if the original file doesn't exist.
								await project.app.fileSystem.move(
									path,
									newFilePath
								)

								// Let the compiler, pack indexer etc. process the renamed file
								await project.updateFile(newFilePath)

								// Remove from recent files
								await project.recentFiles.removeFile(path)

								// Refresh pack explorer
								this.refresh()
							},
						},
						{
							icon: 'mdi-content-duplicate',
							name:
								'windows.packExplorer.fileActions.duplicate.name',
							description:
								'windows.packExplorer.fileActions.duplicate.description',
							onTrigger: async () => {
								// Remove file extension from file name
								const fileName = entry.name
									.split('.')
									.slice(0, -1)
									.join('.')

								const inputWindow = new InputWindow({
									name:
										'windows.packExplorer.fileActions.duplicate.name',
									label: 'general.fileName',
									default: fileName,
									expandText: extname(path),
								})
								const newFileName = await inputWindow.fired
								if (!newFileName) return

								const newFilePath = join(
									dirname(path),
									newFileName
								)

								// If file with same path already exists, confirm that it's ok to overwrite it
								if (
									await project.app.fileSystem.fileExists(
										newFilePath
									)
								) {
									const confirmWindow = new ConfirmationWindow(
										{
											description:
												'general.confirmOverwriteFile',
										}
									)

									if (!(await confirmWindow.fired)) return
								}

								await project.app.fileSystem.copyFile(
									path,
									newFilePath
								)
								await project.updateFile(newFilePath)
								App.eventSystem.dispatch('fileAdded', undefined)
							},
						},
						{
							type: 'divider',
						},
						{
							icon: 'mdi-cogs',
							name:
								'windows.packExplorer.fileActions.viewCompilerOutput.name',
							description:
								'windows.packExplorer.fileActions.viewCompilerOutput.description',
							onTrigger: async () => {
								const app = project.app
								const transformedPath = await project.compilerManager.current.getCompilerOutputPath(
									path
								)
								const fileSystem = app.comMojang.hasComMojang
									? app.comMojang.fileSystem
									: project.fileSystem

								// Information when file does not exist
								if (
									!(await fileSystem.fileExists(
										transformedPath
									))
								) {
									new InformationWindow({
										description:
											'windows.packExplorer.fileActions.viewCompilerOutput.fileMissing',
									})
									return
								}

								const fileHandle = await fileSystem.getFileHandle(
									transformedPath
								)
								await project?.openFile(fileHandle, {
									selectTab: true,
									isReadOnly: true,
								})
							},
						},
				  ]
				: [
						{
							icon: 'mdi-file-plus-outline',
							name:
								'windows.packExplorer.fileActions.createFile.name',
							description:
								'windows.packExplorer.fileActions.createFile.description',
							onTrigger: async () => {
								const inputWindow = new InputWindow({
									name:
										'windows.packExplorer.fileActions.createFile.name',
									label: 'general.fileName',
									default: '',
								})
								const name = await inputWindow.fired
								if (!name) return

								const fileHandle = await project.app.fileSystem.writeFile(
									`${path}/${name}`,
									''
								)

								App.eventSystem.dispatch('fileAdded', undefined)

								// Open file in new tab
								await project.openFile(fileHandle, {
									selectTab: true,
								})
								project.updateChangedFiles()
							},
						},
						{
							icon: 'mdi-folder-plus-outline',
							name:
								'windows.packExplorer.fileActions.createFolder.name',
							description:
								'windows.packExplorer.fileActions.createFolder.description',
							onTrigger: async () => {
								const inputWindow = new InputWindow({
									name:
										'windows.packExplorer.fileActions.createFolder.name',
									label: 'general.fileName',
									default: '',
								})
								const name = await inputWindow.fired
								if (!name) return

								await project.app.fileSystem.mkdir(
									`${path}/${name}`,
									{ recursive: true }
								)
								// Refresh pack explorer
								this.refresh()
							},
						},
						{
							type: 'divider',
						},
						{
							icon: 'mdi-file-search-outline',
							name:
								'windows.packExplorer.fileActions.findInFolder.name',
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
				  ]),
			{
				icon: 'mdi-folder-outline',
				name: 'windows.packExplorer.fileActions.revealFilePath.name',
				description:
					'windows.packExplorer.fileActions.revealFilePath.description',
				onTrigger: () =>
					new InformationWindow({
						name:
							'windows.packExplorer.fileActions.revealFilePath.name',
						description: `[${path}]`,
						isPersistent: false,
					}).open(),
			},
		]
	}

	async showMoreMenu(event: MouseEvent) {
		const app = await App.getApp()

		showContextMenu(event, [
			// Add new file
			{
				icon: 'mdi-plus',
				name: 'windows.packExplorer.createPreset',
				onTrigger: async () => {
					const app = await App.getApp()
					await app.windows.createPreset.open()
				},
			},
			// Reload project
			{
				icon: 'mdi-refresh',
				name: 'windows.packExplorer.refresh.name',
				onTrigger: async () => {
					app.actionManager.trigger('bridge.action.refreshProject')
				},
			},
			// Restart dev server
			{
				icon: 'mdi-restart-alert',
				name: 'windows.packExplorer.restartDevServer.name',
				onTrigger: () => {
					new ConfirmationWindow({
						description:
							'windows.packExplorer.restartDevServer.description',
						height: 168,
						onConfirm: async () => {
							await Promise.all([
								app.project.fileSystem.unlink(
									'.bridge/.lightningCache'
								),
								app.project.fileSystem.unlink(
									'.bridge/.compilerFiles'
								),
							])
							await app.project.fileSystem.writeFile(
								'.bridge/.restartDevServer',
								''
							)

							app.actionManager.trigger(
								'bridge.action.refreshProject'
							)
						},
					})
				},
			},
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
						`projects/${project.name}/config.json`
					)
				},
			},
		])
	}
}
