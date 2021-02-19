import { Sidebar, SidebarItem } from '/@/components/Windows/Layout/Sidebar'
import ExtensionStoreComponent from './ExtensionStore.vue'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
import { App } from '/@/App'
import { compare } from 'compare-versions'
import { getFileSystem } from '/@/utils/fs'
import { ExtensionTag } from './ExtensionTag'
import { ExtensionViewer } from './Extension'
import { IExtensionManifest } from '/@/components/Extensions/ExtensionLoader'

export class ExtensionStoreWindow extends BaseWindow {
	protected baseUrl =
		'https://raw.githubusercontent.com/bridge-core/plugins/master'
	protected sidebar = new Sidebar([])
	protected extensions: ExtensionViewer[] = []
	protected extensionTags!: Record<string, { icon: string; color?: string }>
	protected installedExtensions = new Set<ExtensionViewer>()
	public readonly tags: Record<string, ExtensionTag> = {}

	constructor() {
		super(ExtensionStoreComponent)
		this.defineWindow()
	}

	async open() {
		const app = await App.getApp()
		app.windows.loadingWindow.open()
		this.sidebar.removeElements()
		this.installedExtensions.clear()

		const fs = await getFileSystem()
		this.extensionTags = await fs.readJSON(
			'data/packages/extensionTags.json'
		)

		const installedExtensions = await app.extensionLoader.getInstalledExtensions()

		const extensions = <IExtensionManifest[]>(
			await fetch(`${this.baseUrl}/extensions.json`).then(resp =>
				resp.json()
			)
		)
		this.extensions = extensions.map(
			plugin => new ExtensionViewer(this, plugin)
		)

		installedExtensions.forEach((installedExtension, id) => {
			const extension = this.extensions.find(ext => ext.id === id)

			if (extension) {
				extension.setInstalled()
				extension.setConnected(installedExtension)
				if (compare(installedExtension.version, extension.version, '<'))
					extension.setIsUpdateAvailable()
			} else {
				installedExtension.forStore(this)
			}
		})

		this.setupSidebar()

		app.windows.loadingWindow.close()
		super.open()
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
		Object.values(this.tags).forEach(tag =>
			this.sidebar.addElement(
				tag.asSidebarElement(),
				this.getExtensionsByTag(tag)
			)
		)
	}

	protected getExtensions(findTag?: ExtensionTag) {
		return [...new Set([...this.extensions, ...this.installedExtensions])]
			.filter(plugin => !findTag || plugin.hasTag(findTag))
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
		return this.getExtensions().find(extension => extension.id === id)
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
