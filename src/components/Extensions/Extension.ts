import { IDisposable } from '/@/types/disposable'
import { FileSystem } from '../FileSystem/FileSystem'
import { createErrorNotification } from '/@/components/Notifications/Errors'
import { ExtensionLoader, IExtensionManifest } from './ExtensionLoader'
import { loadUIComponents } from './UI/load'
import { createUIStore } from './UI/store'
import { App } from '/@/App'
import { loadScripts } from './Scripts/loadScripts'
import { ExtensionViewer } from '../Windows/ExtensionStore/ExtensionViewer'
import { ExtensionStoreWindow } from '../Windows/ExtensionStore/ExtensionStore'
import { iterateDir } from '/@/utils/iterateDir'
import { loadFileDefinitions } from './FileDefinition/load'
import { InstallFiles } from './InstallFiles'
import { AnyDirectoryHandle } from '../FileSystem/Types'
import { idbExtensionStore } from './Scripts/Modules/persistentStorage'
import { compareVersions } from 'bridge-common-utils'
import { version as appVersion } from '/@/utils/app/version'
import { JsRuntime } from './Scripts/JsRuntime'
import { createEnv } from './Scripts/require'
import { UIModule } from './Scripts/Modules/ui'

export class Extension {
	protected disposables: IDisposable[] = []
	protected uiStore = createUIStore()
	protected fileSystem: FileSystem
	protected _compilerPlugins: Record<string, string> = {}
	protected isLoaded = false
	protected installFiles: InstallFiles
	protected hasPresets = false
	public jsRuntime: JsRuntime

	get isActive() {
		if (!this.parent.activeStatus)
			throw new Error(
				`Accessed activeStatus property before the corresponding ActiveClass instance was initialized`
			)

		return this.parent.activeStatus?.isActive(this.manifest.id)
	}
	get compilerPlugins() {
		return this._compilerPlugins
	}
	get contributesCompilerPlugins() {
		return Object.keys(this.manifest?.compiler?.plugins ?? {}).length > 0
	}
	get description() {
		return this.manifest.description
	}
	get version() {
		return this.manifest.version
	}
	get isGlobal() {
		return this._isGlobal
	}
	get id() {
		return this.manifest.id
	}
	get manifest() {
		return this._manifest
	}

	constructor(
		protected parent: ExtensionLoader,
		protected _manifest: IExtensionManifest,
		protected baseDirectory: AnyDirectoryHandle,
		protected _isGlobal = false
	) {
		this.fileSystem = new FileSystem(this.baseDirectory)
		this.installFiles = new InstallFiles(
			this.fileSystem,
			_manifest?.contributeFiles ?? {}
		)

		this.jsRuntime = new JsRuntime(
			createEnv(this.id, this.disposables, this.uiStore, this.isGlobal)
		)
	}

	isCompatibleAppEnv() {
		if (!this.manifest.compatibleAppVersions) return true

		return (
			((this.manifest.compatibleAppVersions.min &&
				compareVersions(
					appVersion,
					this.manifest.compatibleAppVersions.min,
					'>='
				)) ||
				!this.manifest.compatibleAppVersions.min) &&
			((this.manifest.compatibleAppVersions.max &&
				compareVersions(
					appVersion,
					this.manifest.compatibleAppVersions.max,
					'<'
				)) ||
				!this.manifest.compatibleAppVersions.max)
		)
	}

	async activate() {
		/**
		 * Make sure we load an extension only once
		 * and that the bridge. app version is compatible
		 */
		if (this.isLoaded || !this.isCompatibleAppEnv()) return

		this.isLoaded = true
		const app = await App.getApp()
		const pluginPath = (
			(await app.fileSystem.baseDirectory.resolve(
				<any>this.baseDirectory
			)) ?? []
		).join('/')

		// Activate all dependencies before
		for (const dep of this.manifest.dependencies ?? []) {
			if (!(await this.parent.activate(dep))) {
				createErrorNotification(
					new Error(
						`Failed to activate extension "${this.manifest.name}": Failed to load one of its dependencies`
					)
				)
				return
			}
		}

		// Disable global extension with same ID if such an extension exists
		if (!this.isGlobal) {
			const globalExtensions = App.instance.extensionLoader

			if (globalExtensions.has(this.id))
				globalExtensions.deactivate(this.id)
		}

		// Compiler plugins
		for (const [pluginId, compilerPlugin] of Object.entries(
			this.manifest.compiler?.plugins ?? {}
		)) {
			this._compilerPlugins[pluginId] = `${pluginPath}/${compilerPlugin}`
		}

		// If the extension has a presets.json file, add this file to the preset store
		if (await this.fileSystem.fileExists('presets.json')) {
			this.hasPresets = true
			App.eventSystem.dispatch('presetsChanged', null)
			this.disposables.push(
				app.windows.createPreset.addPresets(
					`${pluginPath}/presets.json`
				)
			)
		}
		// Otherwise if the extension has a presets folder, add this folder to the preset store
		else if (await this.fileSystem.directoryExists('presets')) {
			this.hasPresets = true
			this.disposables.push(
				app.windows.createPreset.addPresets(`${pluginPath}/presets`)
			)

			App.eventSystem.dispatch('presetsChanged', null)
		}

		try {
			await iterateDir(
				await this.baseDirectory.getDirectoryHandle('themes'),
				(fileHandle) =>
					app.themeManager.loadTheme(
						fileHandle,
						this.isGlobal,
						this.disposables
					)
			)
		} catch {}

		try {
			await loadFileDefinitions(
				await this.baseDirectory.getDirectoryHandle('fileDefinitions'),
				this.disposables
			)
		} catch {}

		let scriptHandle: AnyDirectoryHandle | null = null
		try {
			scriptHandle = await this.baseDirectory.getDirectoryHandle(
				'scripts'
			)
		} catch {}

		let uiHandle: AnyDirectoryHandle | null = null
		try {
			uiHandle = await this.baseDirectory.getDirectoryHandle('ui')
		} catch {}

		if (uiHandle)
			await loadUIComponents(
				this.jsRuntime,
				uiHandle,
				this.uiStore,
				this.disposables
			)

		if (scriptHandle) await loadScripts(this.jsRuntime, scriptHandle)

		// Loading snippets
		if (await this.fileSystem.directoryExists('snippets')) {
			const snippetDir = await this.baseDirectory.getDirectoryHandle(
				'snippets'
			)

			if (this.isGlobal) {
				this.disposables.push(
					app.projectManager.onActiveProject(async (project) => {
						this.disposables.push(
							...(await project.snippetLoader.loadFrom(
								snippetDir
							))
						)
					})
				)
			} else {
				this.disposables.push(
					...(await app.project.snippetLoader.loadFrom(snippetDir))
				)
			}
		}

		if (await this.fileSystem.fileExists('.installed')) return

		await this.installFiles.execute(this.isGlobal)
		await this.fileSystem.writeFile('.installed', '')
	}

	async resetInstalled() {
		await this.fileSystem.unlink('.installed')
	}

	deactivate() {
		if (this.hasPresets) App.eventSystem.dispatch('presetsChanged', null)
		this.disposables.forEach((disposable) => disposable.dispose())
		this.jsRuntime.clearCache()
		this.isLoaded = false

		// Enable global extension with same ID if such an extension exists
		if (!this.isGlobal) {
			const globalExtensions = App.instance.extensionLoader

			if (globalExtensions.has(this.id))
				globalExtensions.activate(this.id)
		}
	}

	async delete() {
		this.deactivate()
		await idbExtensionStore.del(this.id)
		this.parent.deleteExtension(this.manifest.id)
	}

	async setActive(value: boolean) {
		if (value) await this.activate()
		else this.deactivate()

		await this.parent.activeStatus?.setActive(this.manifest.id, value)
	}

	forStore(extensionStore: ExtensionStoreWindow) {
		const viewer = new ExtensionViewer(extensionStore, this.manifest, true)
		viewer.setInstalled()
		viewer.setConnected(this)
		return viewer
	}

	async installFilesToCurrentProject() {
		await this.installFiles.execute(false)
	}
}
