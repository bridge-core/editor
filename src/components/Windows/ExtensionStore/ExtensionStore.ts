import { Sidebar, SidebarItem } from '/@/components/Windows/Layout/Sidebar'
import ExtensionStoreComponent from './ExtensionStore.vue'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
import { App } from '/@/App'
import { compare } from 'compare-versions'
import { getFileSystem } from '/@/utils/fs'
import { ExtensionTag } from './ExtensionTag'
import { ExtensionViewer } from './ExtensionViewer'
import { IExtensionManifest } from '/@/components/Extensions/ExtensionLoader'
import { Notification } from '../../Notifications/Notification'

let updateNotification: Notification | undefined = undefined
export class ExtensionStoreWindow extends BaseWindow {
	protected baseUrl =
		'https://raw.githubusercontent.com/bridge-core/plugins/master'
	protected sidebar = new Sidebar([])
	protected extensions: ExtensionViewer[] = []
	protected extensionTags!: Record<string, { icon: string; color?: string }>
	protected installedExtensions = new Set<ExtensionViewer>()
	public readonly tags: Record<string, ExtensionTag> = {}
	protected updates = new Set<ExtensionViewer>()

	constructor() {
		super(ExtensionStoreComponent)

		App.eventSystem.on('projectChanged', () => {
			updateNotification?.dispose()
			updateNotification = undefined
		})

		this.defineWindow()
	}

	async open() {
		const app = await App.getApp()
		app.windows.loadingWindow.open()
		this.sidebar.removeElements()
		this.installedExtensions.clear()

		const fs = await getFileSystem()
		this.extensionTags = await fs.readJSON(
			'data/packages/common/extensionTags.json'
		)

		const installedExtensions = await app.extensionLoader.getInstalledExtensions()

		const extensions = <IExtensionManifest[]>(
			await fetch(`${this.baseUrl}/extensions.json`).then((resp) =>
				resp.json()
			)
		)
		this.extensions = extensions.map(
			(plugin) => new ExtensionViewer(this, plugin)
		)

		this.updates.clear()

		installedExtensions.forEach((installedExtension, id) => {
			const extension = this.extensions.find((ext) => ext.id === id)

			if (extension) {
				extension.setInstalled()
				extension.setConnected(installedExtension)

				// Update for extension is available
				if (
					compare(installedExtension.version, extension.version, '<')
				) {
					extension.setIsUpdateAvailable()
					this.updates.add(extension)
				}
			} else {
				installedExtension.forStore(this)
			}
		})

		updateNotification?.dispose()

		this.setupSidebar()

		app.windows.loadingWindow.close()
		super.open()
	}

	close() {
		super.close()

		if (this.updates.size > 0) {
			updateNotification = new Notification({
				icon: 'mdi-sync',
				color: 'primary',
				message: 'sidebar.notifications.updateExtensions',
				onClick: () => {
					this.updates.forEach((extension) => extension.update(false))
					updateNotification?.dispose()
				},
			})
		}
	}

	updateInstalled(extension: ExtensionViewer) {
		this.updates.delete(extension)
	}

	setupSidebar() {
		this.sidebar.addElement(
			new SidebarItem({
				id: 'all',
				text: 'All',
				icon: 'mdi-format-list-bulleted-square',
				color: 'primary',
			}),
			this.getExtensions()
		)
		this.sidebar.addElement(
			new SidebarItem({
				id: 'installed',
				text: 'Installed',
				icon: 'mdi-download-circle-outline',
				color: 'primary',
			}),
			this.installedExtensions
		)
		Object.values(this.tags).forEach((tag) =>
			this.sidebar.addElement(
				tag.asSidebarElement(),
				this.getExtensionsByTag(tag)
			)
		)
		this.sidebar.setDefaultSelected()
	}

	protected getExtensions(findTag?: ExtensionTag) {
		return [...new Set([...this.extensions, ...this.installedExtensions])]
			.filter((plugin) => !findTag || plugin.hasTag(findTag))
			.sort(
				({ releaseTimestamp: tA }, { releaseTimestamp: tB }) => tB - tA
			)
	}
	protected getExtensionsByTag(findTag: ExtensionTag) {
		return this.getExtensions(findTag)
	}
	getTagIcon(tagName: string) {
		return this.extensionTags[tagName].icon
	}
	getTagColor(tagName: string) {
		return this.extensionTags[tagName].color
	}
	getExtensionById(id: string) {
		return this.getExtensions().find((extension) => extension.id === id)
	}

	get selectedSidebar() {
		return this.sidebar.selected
	}
	set selectedSidebar(val) {
		this.sidebar.clearFilter()
		this.sidebar.selected = val
	}

	getBaseUrl() {
		return this.baseUrl
	}
	addInstalledExtension(extension: ExtensionViewer) {
		this.installedExtensions.add(extension)
	}
}
