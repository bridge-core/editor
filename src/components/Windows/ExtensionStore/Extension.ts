import { App } from '@/App'
import { Extension } from '@/components/Extensions/Extension'
import { IExtensionManifest } from '@/components/Extensions/ExtensionLoader'
import { selectedProject } from '@/components/Project/Loader'
import { InformedChoiceWindow } from '@/components/Windows/InformedChoice/InformedChoice'
import { ExtensionStoreWindow } from './ExtensionStore'
import { ExtensionTag } from './ExtensionTag'

export class ExtensionViewer {
	protected tags: ExtensionTag[]
	protected isLoading = false
	protected _isInstalled = false
	protected isActive = false
	protected isUpdateAvailable = false
	protected connected?: Extension

	constructor(
		protected parent: ExtensionStoreWindow,
		protected config: IExtensionManifest
	) {
		this.tags = this.config.tags.map(tag => {
			if (!this.parent.tags[tag])
				this.parent.tags[tag] = new ExtensionTag(this.parent, tag)
			return this.parent.tags[tag]
		})
	}

	//#region Config getters
	get author() {
		return this.config.author
	}
	get name() {
		return this.config.name
	}
	get version() {
		return this.config.version
	}
	get description() {
		return this.config.description
	}
	get icon() {
		return this.config.icon
	}
	get id() {
		return this.config.id
	}
	//#endregion

	get isInstalled() {
		return this._isInstalled
	}

	hasTag(tag: ExtensionTag) {
		return this.tags.includes(tag)
	}

	async download(isGlobalInstall?: boolean) {
		if (isGlobalInstall !== undefined)
			return this.downloadPlugin(isGlobalInstall)

		const installLocationChoiceWindow = new InformedChoiceWindow(
			'windows.pluginInstallLocation.title'
		)
		const actionManager = await installLocationChoiceWindow.actionManager
		actionManager.create({
			icon: 'mdi-folder-multiple-outline',
			name: 'actions.pluginInstallLocation.global.name',
			description: 'actions.pluginInstallLocation.global.description',
			onTrigger: () => {
				this.downloadPlugin(true)
			},
		})
		actionManager.create({
			icon: 'mdi-folder-outline',
			name: 'actions.pluginInstallLocation.local.name',
			description: 'actions.pluginInstallLocation.local.description',
			onTrigger: () => {
				this.downloadPlugin(false)
			},
		})
	}

	protected async downloadPlugin(isGlobalInstall: boolean) {
		this.isLoading = true

		const app = await App.getApp()
		const zip = await fetch(
			this.parent.getBaseUrl() + this.config.link
		).then(response => response.arrayBuffer())

		const basePath = !isGlobalInstall
			? `projects/${selectedProject}/bridge/plugins`
			: 'plugins'
		const zipPath = basePath + `/${this.name.replace(/\s+/g, '')}.zip`
		await app.fileSystem.writeFile(zipPath, zip)

		// Delete old folder
		try {
			await app.fileSystem.unlink(zipPath.replace('.zip', ''))
		} catch {}

		// Unzip & activate extension
		await app.extensionLoader.loadExtension(
			await app.fileSystem.getDirectoryHandle(basePath),
			await app.fileSystem.getFileHandle(zipPath),
			true
		)

		this.setInstalled()
		this.isUpdateAvailable = false
		this.isLoading = false
	}

	async update() {
		if (!this.connected) return

		this.connected.deactivate()
		await this.downloadPlugin(this.connected.isGlobal)
	}

	setInstalled() {
		this._isInstalled = true
		this.parent.addInstalledExtension(this)
	}
	setIsUpdateAvailable() {
		this.isUpdateAvailable = true
	}
	setConnected(ext: Extension) {
		this.connected = ext
	}
}
