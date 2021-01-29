import {
	ISidebarItemConfig,
	Sidebar,
	SidebarItem,
} from '@/components/Windows/Layout/Sidebar'
import ExtensionStoreComponent from './ExtensionStore.vue'
import { BaseWindow } from '@/components/Windows/BaseWindow'
import { App } from '@/App'
import { compare, CompareOperator } from 'compare-versions'
import { getFileSystem } from '@/utils/fs'
import { PluginTag } from './PluginTag'
import { Plugin } from './Plugin'

export interface ILoadedPlugin {
	icon: string
	author: string
	name: string
	version: string
	id: string
	description: string
	link: string
	tags: string[]
}

interface IPlugin {
	icon: string
	author: string
	name: string
	version: string
	id: string
	description: string
	link: string
	tags: ITag[]
}

interface ITag {
	text: string
	icon: string
	color: string
}

export class ExtensionStoreWindow extends BaseWindow {
	protected baseUrl =
		'https://raw.githubusercontent.com/bridge-core/plugins/master'
	protected sidebar = new Sidebar([])
	protected plugins: Plugin[] = []
	protected extensionTags!: Record<string, { icon: string; color?: string }>
	public readonly tags: Record<string, PluginTag> = {}

	constructor() {
		super(ExtensionStoreComponent)
		this.defineWindow()
	}

	async open() {
		const app = await App.getApp()
		app.windows.loadingWindow.open()
		this.sidebar.removeElements()

		const fs = await getFileSystem()
		this.extensionTags = await fs.readJSON(
			'data/packages/extensionTags.json'
		)

		const plugins = <ILoadedPlugin[]>(
			await fetch(`${this.baseUrl}/plugins.json`).then(resp =>
				resp.json()
			)
		)
		this.plugins = plugins.map(plugin => new Plugin(this, plugin))

		this.setupSidebar()
		console.log(this.plugins)

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
			this.plugins
		)
		this.sidebar.addElement(
			new SidebarItem({
				id: 'installed',
				text: 'Installed',
				icon: 'mdi-download-circle-outline',
				color: 'primary',
			}),
			this.plugins
		)
		Object.values(this.tags).forEach(tag =>
			this.sidebar.addElement(
				tag.asSidebarElement(),
				this.getPluginsByTag(tag)
			)
		)
	}

	getPluginsByTag(findTag: PluginTag) {
		return this.plugins.filter(plugin => plugin.hasTag(findTag))
	}
	getTagIcon(tagName: string) {
		return this.extensionTags[tagName].icon
	}
	getTagColor(tagName: string) {
		return this.extensionTags[tagName].color
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
}
