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

export class Extension {
	protected disposables: IDisposable[] = []
	protected uiStore = createUIStore()
	protected fileSystem: FileSystem
	protected _compilerPlugins: Record<string, string> = {}
	protected isLoaded = false
	protected installFiles: InstallFiles

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
	get version() {
		return this.manifest.version
	}
	get isGlobal() {
		return this._isGlobal
	}

	constructor(
		protected parent: ExtensionLoader,
		protected manifest: IExtensionManifest,
		protected baseDirectory: FileSystemDirectoryHandle,
		protected _isGlobal = false
	) {
		this.fileSystem = new FileSystem(this.baseDirectory)
		this.installFiles = new InstallFiles(
			this.fileSystem,
			manifest?.install ?? {}
		)
	}

	async activate() {
		// Make sure we load an extension only once
		if (this.isLoaded) return

		this.isLoaded = true
		const app = await App.getApp()
		const pluginPath = (
			(await app.fileSystem.baseDirectory.resolve(this.baseDirectory)) ??
			[]
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

		// Compiler plugins
		for (const [pluginId, compilerPlugin] of Object.entries(
			this.manifest.compiler?.plugins ?? {}
		)) {
			this._compilerPlugins[pluginId] = `${pluginPath}/${compilerPlugin}`
		}

		this.disposables.push(
			app.windows.createPreset.addPresets(`${pluginPath}/presets`)
		)

		try {
			await iterateDir(
				await this.baseDirectory.getDirectoryHandle('themes'),
				async (fileHandle) =>
					app.themeManager.loadTheme(
						await fileHandle.getFile(),
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

		let scriptHandle: FileSystemDirectoryHandle
		try {
			scriptHandle = await this.baseDirectory.getDirectoryHandle(
				'scripts'
			)
		} catch {}

		await Promise.all([
			loadUIComponents(
				this.fileSystem,
				this.uiStore,
				this.disposables
			).then(async () =>
				scriptHandle
					? await loadScripts(
							scriptHandle,
							this.uiStore,
							this.disposables,
							this.isGlobal
					  )
					: undefined
			),
		])

		if (await this.fileSystem.fileExists('.installed')) return

		await this.installFiles.execute(this.isGlobal)
		await this.fileSystem.writeFile('.installed', '')
	}

	deactivate() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.isLoaded = false
	}

	async setActive(value: boolean) {
		if (value) await this.activate()
		else this.deactivate()

		await this.parent.activeStatus?.setActive(this.manifest.id, value)
	}

	forStore(extensionStore: ExtensionStoreWindow) {
		const viewer = new ExtensionViewer(extensionStore, this.manifest)
		viewer.setInstalled()
		return viewer
	}

	async installFilesToCurrentProject() {
		await this.installFiles.execute(false)
	}
}
