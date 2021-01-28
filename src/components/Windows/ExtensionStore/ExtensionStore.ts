import { Sidebar, SidebarItem } from '@/components/Windows/Layout/Sidebar'
import ExtensionStoreComponent from './ExtensionStore.vue'
import { BaseWindow } from '@/components/Windows/BaseWindow'
import { App } from '@/App'
import { compare, CompareOperator } from 'compare-versions'
import { getFileSystem } from '@/utils/fs'

interface ILoadedPlugin {
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
	protected plugins: IPlugin[] = []

	constructor() {
		super(ExtensionStoreComponent)
		this.defineWindow()
	}

	async open() {
		const app = await App.getApp()
		app.windows.loadingWindow.open()
		this.sidebar.removeElements()

		const fs = await getFileSystem()
		const extensionTags = await fs.readJSON(
			'data/packages/extensionTags.json'
		)

		const plugins = <ILoadedPlugin[]>(
			await fetch(`${this.baseUrl}/plugins.json`).then(resp =>
				resp.json()
			)
		)
		this.plugins = plugins.map(plugin => ({
			...plugin,
			tags: plugin.tags.map(tag =>
				extensionTags[tag]
					? { ...extensionTags[tag], text: tag }
					: { text: tag, icon: 'mdi-circle' }
			),
		}))

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
		this.tags.forEach(tag =>
			this.sidebar.addElement(
				new SidebarItem({
					id: tag.text.toLowerCase(),
					...tag,
				}),
				this.getPluginsByTag(tag)
			)
		)
	}

	get tags() {
		const tags: ITag[] = []

		this.plugins.forEach(plugin =>
			plugin.tags.forEach(addTag => {
				if (!tags.some(findTag => findTag.text === addTag.text))
					tags.push(addTag)
			})
		)

		return tags
	}
	getPluginsByTag(findTag: ITag) {
		return this.plugins.filter(plugin =>
			plugin.tags.some(tag => tag.text === findTag.text)
		)
	}

	get selectedSidebar() {
		return this.sidebar.selected
	}
	set selectedSidebar(val) {
		this.sidebar.clearFilter()
		this.sidebar.selected = val
	}
}
