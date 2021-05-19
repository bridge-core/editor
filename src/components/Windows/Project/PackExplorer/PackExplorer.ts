import { App } from '/@/App'
import { FileType } from '/@/components/Data/FileType'
import { PackType } from '/@/components/Data/PackType'
import { BaseWindow } from '../../BaseWindow'
import {
	ISidebarItemConfig,
	Sidebar,
	SidebarCategory,
	SidebarItem,
} from '../../Layout/Sidebar'
import PackExplorerComponent from './PackExplorer.vue'
import { DirectoryEntry } from './DirectoryEntry'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { InformationWindow } from '../../Common/Information/InformationWindow'

class PackSidebarItem extends SidebarItem {
	protected packType: string
	protected kind: 'file' | 'directory'
	constructor(
		config: ISidebarItemConfig & {
			packType: string
			kind: 'file' | 'directory'
		}
	) {
		super(config)
		this.packType = config.packType
		this.kind = config.kind
	}
}

export class PackExplorerWindow extends BaseWindow {
	protected loadedPack = false
	protected sidebar = new Sidebar([])

	constructor() {
		super(PackExplorerComponent, false, true)
		App.eventSystem.on('projectChanged', () => {
			this.sidebar.resetSelected()
			this.loadedPack = false
		})
		this.defineWindow()

		// Reload project
		this.addAction(
			new SimpleAction({
				icon: 'mdi-refresh',
				name: 'windows.packExplorer.refresh',
				onTrigger: async () => {
					this.close()
					const app = await App.getApp()
					await app.project.refresh()
				},
			})
		)
		// Add new file
		this.addAction(
			new SimpleAction({
				icon: 'mdi-plus',
				name: 'windows.packExplorer.createPreset',
				onTrigger: async () => {
					this.close()
					const app = await App.getApp()
					await app.windows.createPreset.open()
				},
			})
		)
	}

	async loadPack() {
		this.sidebar.removeElements()

		const app = await App.getApp()
		const dirents = (await app.project?.packIndexer.readdir([])) ?? []
		const packSpiderEnabled =
			settingsState?.general?.enablePackSpider ?? true

		for (const { kind, displayName, name, path } of <any[]>dirents) {
			const fileType = packSpiderEnabled
				? FileType.get(undefined, name)
				: FileType.get(path, name)

			const packType =
				PackType.get(`projects/test/${path}`) ??
				PackType.get(
					`projects/test/${
						typeof fileType?.matcher === 'string'
							? fileType?.matcher
							: fileType?.matcher[0]
					}`
				)

			const icon =
				fileType && fileType.icon
					? fileType.icon
					: `mdi-${kind === 'directory' ? 'folder' : 'file'}-outline`
			const text =
				displayName ?? app.locales.translate(`fileType.${name}`)
			const color = packType ? packType.color : undefined

			if (packType) {
				// This dirent belongs to a specific packType
				const packText = `packType.${packType.id}.name`
				// Get the packType category if it already exists
				let category = <SidebarCategory | undefined>(
					this.sidebar.rawElements.find(
						(element) => element.getText() === packText
					)
				)
				// Otherwise create the category & add it to the sidebar
				if (!category) {
					category = new SidebarCategory({
						isOpen: false,
						text: packText,
						items: [],
					})
					this.sidebar.addElement(category)
				}

				// Add the dirent to the packType category
				category.addItem(
					new PackSidebarItem({
						kind,
						packType: packType.id,
						id: path ?? name,
						text,

						icon,
						color,
					})
				)
			} else {
				// This dirent belongs to no pack
				// so we just add it to the sidebar without a category
				this.sidebar.addElement(
					new PackSidebarItem({
						kind,
						packType: 'unknown',
						id: path ?? name,
						text,

						icon,
						color,
					})
				)
			}

			this.sidebar.setState(path ?? name, {
				text,
				icon,
				color,
				directoryEntry:
					kind === 'directory'
						? await DirectoryEntry.create(
								(path ?? name)?.split('/')
						  )
						: undefined,
			})
		}

		this.loadedPack = true
		this.sidebar.setDefaultSelected()
		super.open()
	}

	async open() {
		if (!this.loadedPack) {
			const app = await App.getApp()
			app.windows.loadingWindow.open()

			await this.loadPack()

			app.windows.loadingWindow.close()
		}

		super.open()
	}
	close() {
		App.audioManager.playAudio('click5.ogg', 1)
		this.loadedPack = false
		super.close()
	}

	async getContextMenu(
		type: 'file' | 'folder' | 'virtualFolder',
		path: string,
		entry: DirectoryEntry
	) {
		if (type === 'virtualFolder') return []

		return [
			{
				icon: 'mdi-delete-outline',
				name: 'windows.packExplorer.fileActions.delete.name',
				description:
					'windows.packExplorer.fileActions.delete.description',
				onTrigger: async () => {
					const project = await App.getApp().then(
						(app) => app.project
					)
					entry.remove()

					await Promise.all([
						project.packIndexer.unlink(path),
						project.compilerManager.unlink(path),
					])

					await project.jsonDefaults.reload()

					await project.fileSystem.unlink(path)
				},
			},
			// TODO
			// {
			// 	icon: 'mdi-pencil-outline',
			// 	name: 'Rename',
			// 	description: 'Rename a file or folder',
			// 	onTrigger: () => console.log('TODO'),
			// },
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
}
