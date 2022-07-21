import { App } from '/@/App'
import { Extension } from '/@/components/Extensions/Extension'
import { IExtensionManifest } from '/@/components/Extensions/ExtensionLoader'
import { InformedChoiceWindow } from '/@/components/Windows/InformedChoice/InformedChoice'
import { ExtensionStoreWindow } from './ExtensionStore'
import { ExtensionTag } from './ExtensionTag'
import { extensionActions } from './ExtensionActions'
import { ConfirmationWindow } from '../Common/Confirm/ConfirmWindow'
import { compareVersions } from 'bridge-common-utils'
import { version as appVersion } from '/@/utils/app/version'

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
		protected config: IExtensionManifest,
		public readonly isLocalOnly: boolean = false
	) {
		this.tags = this.config.tags
			.map((tag) => {
				if (!this.parent.tags[tag])
					this.parent.tags[tag] = new ExtensionTag(this.parent, tag)
				return this.parent.tags[tag]
			})
			.sort((a, b) => a.getText().localeCompare(b.getText()))
	}

	//#region Config getters
	get author() {
		return this.manifest.author
	}
	get name() {
		return this.manifest.name
	}
	get version() {
		return this.manifest.version
	}
	get description() {
		return this.manifest.description
	}
	get icon() {
		return this.manifest.icon
	}
	get id() {
		return this.manifest.id
	}
	get releaseTimestamp() {
		return this.config.releaseTimestamp ?? Date.now()
	}
	get readme() {
		return this.manifest.readme
	}
	get manifest() {
		if (this.isUpdateAvailable) return this.config

		return this.connected?.manifest ?? this.config
	}
	//#endregion

	get isInstalled() {
		return this._isInstalled
	}
	get actions() {
		return extensionActions(this)
	}
	get extension() {
		return this.connected
	}
	get isGlobal() {
		return this.connected?.isGlobal ?? false
	}
	get onlineVersion() {
		return this.config.version
	}

	hasTag(tag: ExtensionTag) {
		return this.tags.includes(tag)
	}

	isCompatibleVersion() {
		return (
			!this.config.compatibleAppVersions ||
			(((this.config.compatibleAppVersions.min &&
				compareVersions(
					appVersion,
					this.config.compatibleAppVersions.min,
					'>='
				)) ||
				!this.config.compatibleAppVersions.min) &&
				((this.config.compatibleAppVersions.max &&
					compareVersions(
						appVersion,
						this.config.compatibleAppVersions.max,
						'<='
					)) ||
					!this.config.compatibleAppVersions.max))
		)
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

	protected async downloadExtension(
		isGlobalInstall: boolean,
		isUpdateDownload = false,
		shouldActivateExtension = true
	) {
		this.isLoading = true

		const app = await App.getApp()
		const zip = await fetch(
			this.parent.getBaseUrl() + this.config.link
		).then((response) => response.arrayBuffer())

		const basePath = !isGlobalInstall
			? `${app.project.projectPath}/.bridge/extensions`
			: '~local/extensions'
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
				else if (!extension.isActive && extension.connected)
					extension.connected?.activate()
			}
		}

		// Unzip & activate extension
		const extension = await extensionLoader.loadExtension(
			await app.fileSystem.getDirectoryHandle(basePath),
			await app.fileSystem.getFileHandle(zipPath),
			shouldActivateExtension
		)

		if (extension) this.setConnected(extension)

		this.setInstalled()
		this.isUpdateAvailable = false
		this.isLoading = false

		if (!isUpdateDownload) {
			if (extension?.contributesCompilerPlugins) {
				new ConfirmationWindow({
					title:
						'windows.extensionStore.compilerPluginDownload.title',
					description:
						'windows.extensionStore.compilerPluginDownload.description',
					cancelText: 'general.later',
					confirmText:
						'windows.extensionStore.compilerPluginDownload.openConfig',
					onConfirm: async () => {
						this.parent.close()

						const app = await App.getApp()
						const project = app.project

						const config = project.config.get()

						if (config.compiler) {
							await project.openFile(
								await project.fileSystem.getFileHandle(
									'config.json'
								)
							)
						} else {
							await project.openFile(
								await project.fileSystem.getFileHandle(
									'.bridge/compiler/default.json'
								)
							)
						}
					},
				})
			}
		}
	}

	async update(notifyParent = true) {
		if (!this.connected) return

		if (notifyParent) this.parent.updateInstalled(this)

		const wasExtensionActive = this.connected.isActive
		this.connected.deactivate()
		await this.connected.resetInstalled()
		await this.downloadExtension(
			this.connected.isGlobal,
			true,
			wasExtensionActive
		)
	}
	delete() {
		if (!this.connected) return

		this.connected?.delete()
		this.parent.delete(this)
		this._isInstalled = false
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
		if (!this.connected)
			throw new Error(`No extension connected to ExtensionViewer`)

		this.connected.setActive(value)
		this.isActive = value
	}
	closeActionMenu() {
		this.showMenu = false
	}

	get canShare() {
		return typeof navigator.share === 'function'
	}
	async share() {
		if (!this.canShare) return

		const url = new URL(window.location.href)
		url.searchParams.set('viewExtension', encodeURIComponent(this.id))

		await navigator
			.share({
				title: `Extension: ${this.name}`,
				text: `View the extension "${this.name}" within bridge. v2!`,
				url: url.href,
			})
			.catch(() => {})
	}
}
