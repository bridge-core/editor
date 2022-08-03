import { Sidebar, SidebarItem } from '/@/components/Windows/Layout/Sidebar'
import ExtensionStoreComponent from './ExtensionStore.vue'
import { App } from '/@/App'
import { compareVersions } from 'bridge-common-utils'
import { ExtensionTag } from './ExtensionTag'
import { ExtensionViewer } from './ExtensionViewer'
import { IExtensionManifest } from '/@/components/Extensions/ExtensionLoader'
import { Notification } from '/@/components/Notifications/Notification'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'
import { IWindowState, NewBaseWindow } from '../NewBaseWindow'
import { reactive } from 'vue'

let updateNotification: Notification | undefined = undefined

interface IExtensionStoreState extends IWindowState {
	extensions: ExtensionViewer[]
}
export class ExtensionStoreWindow extends NewBaseWindow {
	protected baseUrl =
		'https://raw.githubusercontent.com/bridge-core/plugins/master'
	protected sidebar = new Sidebar([])
	protected extensionTags!: Record<string, { icon: string; color?: string }>
	protected installedExtensions: ExtensionViewer[] = []
	public readonly tags: Record<string, ExtensionTag> = {}
	protected updates = new Set<ExtensionViewer>()
	// TODO: Why TypeScript + Vue?! If we don't cast to any first, it will complain about a missing method
	// because it unwraps the SimpleAction class instances for some weird reason
	protected state: IExtensionStoreState = <any>reactive({
		...super.state,
		extensions: [],
	})

	constructor() {
		super(ExtensionStoreComponent)

		App.eventSystem.on('projectChanged', () => {
			updateNotification?.dispose()
			updateNotification = undefined
		})

		this.defineWindow()
	}

	async open(filter?: string) {
		const app = await App.getApp()
		app.windows.loadingWindow.open()
		this.sidebar.removeElements()
		this.installedExtensions = []

		await app.dataLoader.fired
		this.extensionTags = await app.dataLoader.readJSON(
			'data/packages/common/extensionTags.json'
		)

		const installedExtensions =
			await app.extensionLoader.getInstalledExtensions()

		let extensions: IExtensionManifest[]
		try {
			extensions = navigator.onLine
				? await fetch(`${this.baseUrl}/extensions.json`).then((resp) =>
						resp.json()
				  )
				: [...installedExtensions.values()].map((ext) => ext.manifest)
		} catch {
			return this.createOfflineWindow()
		}

		// User doesn't have local extensions and is offline
		if (extensions.length === 0 && !navigator.onLine)
			return this.createOfflineWindow()

		this.state.extensions = extensions.map(
			(extension) => new ExtensionViewer(this, extension)
		)

		this.updates.clear()

		installedExtensions.forEach((installedExtension) => {
			const extension = this.state.extensions.find(
				(ext) => ext.id === installedExtension.id
			)

			if (extension) {
				extension.setInstalled()
				extension.setConnected(installedExtension)

				// Update for extension is available
				if (
					compareVersions(
						installedExtension.version,
						extension.onlineVersion,
						'<'
					)
				) {
					extension.setIsUpdateAvailable()
					this.updates.add(extension)
				}
			} else {
				this.state.extensions.push(installedExtension.forStore(this))
			}
		})

		updateNotification?.dispose()

		this.setupSidebar()

		if (filter) this.sidebar.setFilter(filter)

		app.windows.loadingWindow.close()
		super.open()
	}

	async createOfflineWindow() {
		const app = await App.getApp()

		app.windows.loadingWindow.close()
		new InformationWindow({
			description: 'windows.extensionStore.offlineError',
		})
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
	delete(extension: ExtensionViewer) {
		const index = this.installedExtensions.findIndex(
			(e) => e.id === extension.id
		)
		if (index === -1) return

		this.installedExtensions.splice(index, 1)

		if (extension.isLocalOnly)
			this.state.extensions = this.state.extensions.filter(
				(e) => e.id !== extension.id
			)
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
		return [
			...new Set([...this.state.extensions, ...this.installedExtensions]),
		].filter((ext) => !ext.isLocalOnly && (!findTag || ext.hasTag(findTag)))
	}
	protected getExtensionsByTag(findTag: ExtensionTag) {
		return this.getExtensions(findTag)
	}
	getTagIcon(tagName: string) {
		return this.extensionTags[tagName]?.icon
	}
	getTagColor(tagName: string) {
		return this.extensionTags[tagName]?.color
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
		this.installedExtensions.push(extension)
	}
}
