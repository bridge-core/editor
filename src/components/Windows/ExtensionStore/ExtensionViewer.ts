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
	protected connected: Extension[] = []
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
		if (this.isUpdateAvailable) return this.config ?? {}

		return this.extension?.manifest ?? this.config ?? {}
	}
	//#endregion

	get compilerPlugins() {
		const ext = this.extension
		if (ext) return Object.keys(ext.compilerPlugins ?? {})

		return Object.keys(this.config?.compiler?.plugins ?? {})
	}
	get isInstalled() {
		return this._isInstalled
	}
	get actions() {
		return extensionActions(this).filter((action) => action !== null)
	}

	get isGlobal() {
		return this.extension?.isGlobal ?? false
	}
	get onlineVersion() {
		return this.config.version
	}
	get isInstalledLocallyAndGlobally() {
		return this.connected.length === 2
	}
	get extension() {
		if (this.connected.length === 0) return null
		const localExtension = this.connected.find((ext) => !ext.isGlobal)
		if (localExtension) return localExtension

		return this.connected[0]
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
						'<'
					)) ||
					!this.config.compatibleAppVersions.max))
		)
	}

	async download(isGlobalInstall?: boolean) {
		const app = await App.getApp()
		if (isGlobalInstall !== undefined)
			return this.downloadExtension(isGlobalInstall)

		// If the user is on the HomeView, only allow global extension installations
		if (app.isNoProjectSelected) return this.downloadExtension(true)

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
					extension.connected.forEach((ext) => ext.activate())
			}
		}

		// Unzip & activate extension
		const extension = await extensionLoader.loadExtension(
			await app.fileSystem.getDirectoryHandle(basePath),
			await app.fileSystem.getFileHandle(zipPath),
			// Only activate extension if we're supposed to and the currently connected extension is global
			shouldActivateExtension &&
				(this.connected.length === 0 || this.extension?.isGlobal)
		)

		if (extension) this.setConnected(extension)

		this.setInstalled()
		this.isUpdateAvailable = false
		this.isLoading = false

		if (!isUpdateDownload) {
			if (extension?.contributesCompilerPlugins) {
				new ConfirmationWindow({
					title: 'windows.extensionStore.compilerPluginDownload.title',
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
		if (this.connected.length === 0) return

		if (notifyParent) this.parent.updateInstalled(this)

		const wasExtensionActive = this.connected.map((ext) => ext.isActive)

		this.connected.forEach((ext) => ext.deactivate())
		await Promise.all(
			this.connected.map(async (ext, i) => {
				await ext.resetInstalled()

				await this.downloadExtension(
					ext.isGlobal,
					true,
					wasExtensionActive[i]
				)
			})
		)
	}
	delete() {
		if (this.connected.length === 0) return

		this.extension?.delete()

		this.connected = this.connected.filter((ext) => ext !== this.extension)

		if (this.connected.length === 0) {
			this.parent.delete(this)
			this._isInstalled = false
		}
	}

	setInstalled() {
		this._isInstalled = true
		this.parent.addInstalledExtension(this)
	}
	setIsUpdateAvailable() {
		this.isUpdateAvailable = true
	}
	setConnected(ext: Extension) {
		this.connected.push(ext)

		this.isActive = this.extension?.isActive ?? false
	}

	setActive(value: boolean) {
		if (!this.connected)
			throw new Error(`No extension connected to ExtensionViewer`)

		// Deactivate all connected extensions
		if (!value) this.connected.forEach((ext) => ext.setActive(value))
		// But only activate the current extension
		else this.extension?.setActive(value)

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
				text: `View the extension "${this.name}" within bridge.!`,
				url: url.href,
			})
			.catch(() => {})
	}
}
