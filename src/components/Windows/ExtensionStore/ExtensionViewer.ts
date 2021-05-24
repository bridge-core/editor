import { App } from '/@/App'
import { Extension } from '/@/components/Extensions/Extension'
import { IExtensionManifest } from '/@/components/Extensions/ExtensionLoader'
import { InformedChoiceWindow } from '/@/components/Windows/InformedChoice/InformedChoice'
import { ExtensionStoreWindow } from './ExtensionStore'
import { ExtensionTag } from './ExtensionTag'
import { extensionActions } from './ExtensionActions'

export class ExtensionViewer {
	protected tags: ExtensionTag[]
	protected isLoading = false
	protected _isInstalled = false
	protected isUpdateAvailable = false
	protected connected?: Extension
	protected showMenu = false
	public isActive = true

	constructor(
		protected parent: ExtensionStoreWindow,
		protected config: IExtensionManifest
	) {
		this.tags = this.config.tags.map((tag) => {
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
	get releaseTimestamp() {
		return this.config.releaseTimestamp ?? Date.now()
	}
	//#endregion

	get isInstalled() {
		return this._isInstalled
	}
	get displayVersion() {
		return this.connected?.version ?? this.config.version
	}
	get actions() {
		return extensionActions(this)
	}
	get extension() {
		return this.connected
	}

	hasTag(tag: ExtensionTag) {
		return this.tags.includes(tag)
	}

	async download(isGlobalInstall?: boolean) {
		if (isGlobalInstall !== undefined)
			return this.downloadExtension(isGlobalInstall)

		const installLocationChoiceWindow = new InformedChoiceWindow(
			'windows.pluginInstallLocation.title'
		)
		const actionManager = await installLocationChoiceWindow.actionManager
		actionManager.create({
			icon: 'mdi-folder-multiple-outline',
			name: 'actions.pluginInstallLocation.global.name',
			description: 'actions.pluginInstallLocation.global.description',
			onTrigger: () => {
				this.downloadExtension(true)
			},
		})
		actionManager.create({
			icon: 'mdi-folder-outline',
			name: 'actions.pluginInstallLocation.local.name',
			description: 'actions.pluginInstallLocation.local.description',
			onTrigger: () => {
				this.downloadExtension(false)
			},
		})
	}

	protected async downloadExtension(isGlobalInstall: boolean) {
		this.isLoading = true

		const app = await App.getApp()
		const zip = await fetch(
			this.parent.getBaseUrl() + this.config.link
		).then((response) => response.arrayBuffer())

		const basePath = !isGlobalInstall
			? `projects/${app.selectedProject}/.bridge/extensions`
			: 'extensions'
		const extensionLoader = isGlobalInstall
			? app.extensionLoader
			: app.project.extensionLoader
		const zipPath = basePath + `/${this.name.replace(/\s+/g, '')}.zip`
		await app.fileSystem.writeFile(zipPath, zip)

		// Delete old folder
		try {
			await app.fileSystem.unlink(zipPath.replace('.zip', ''))
		} catch {}

		// Install dependencies
		for (const dependency of this.config.dependencies ?? []) {
			const extension = this.parent.getExtensionById(dependency)
			if (extension) {
				if (!extension.isInstalled)
					await extension.downloadExtension(isGlobalInstall)
				// TODO: Activate inactive extension
				// else if(!extension.isActive)
			}
		}

		// Unzip & activate extension
		const extension = await extensionLoader.loadExtension(
			await app.fileSystem.getDirectoryHandle(basePath),
			await app.fileSystem.getFileHandle(zipPath),
			true
		)

		if (extension) this.setConnected(extension)

		this.setInstalled()
		this.isUpdateAvailable = false
		this.isLoading = false

		App.audioManager.playAudio('confirmation_002.ogg', 1)
	}

	async update(notifyParent = true) {
		if (!this.connected) return

		if (notifyParent) this.parent.updateInstalled(this)

		this.connected.deactivate()
		await this.downloadExtension(this.connected.isGlobal)
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
		this.isActive = this.connected?.isActive
	}

	setActive(value: boolean) {
		App.audioManager.playAudio('click5.ogg', 1)
		if (!this.connected)
			throw new Error(`No extension connected to ExtensionViewer`)

		this.connected.setActive(value)
		this.isActive = value
	}
	closeActionMenu() {
		App.audioManager.playAudio('click5.ogg', 1)
		this.showMenu = false
	}
}
