import { IDisposable } from '@/types/disposable'
import { FileSystem } from '../FileSystem/Main'
import { createErrorNotification } from '@/components/Notifications/Errors'
import { ExtensionLoader, IExtensionManifest } from './ExtensionLoader'
import { loadUIComponents } from './UI/load'
import { createUIStore } from './UI/store'
import { App } from '@/App'
import { loadScripts } from './Scripts/loadScripts'
import { ExtensionViewer } from '../Windows/ExtensionStore/Extension'
import { ExtensionStoreWindow } from '../Windows/ExtensionStore/ExtensionStore'

export class Extension {
	protected _isActive = false
	protected _isGlobal = false
	protected disposables: IDisposable[] = []
	protected uiStore = createUIStore()
	protected fileSystem: FileSystem
	get isActive() {
		return this._isActive
	}

	constructor(
		protected parent: ExtensionLoader,
		protected manifest: IExtensionManifest,
		protected baseDirectory: FileSystemDirectoryHandle
	) {
		this.fileSystem = new FileSystem(this.baseDirectory)
	}

	async activate() {
		this._isActive = true
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

		Object.entries(
			this.manifest.compilerPlugins ?? {}
		)?.forEach(([pluginId, compilerPlugin]) =>
			this.disposables.push(
				app.compiler.addCompilerPlugin(
					pluginId,
					`${pluginPath}/${compilerPlugin}`
				)
			)
		)

		this.disposables.push(
			app.windows.createPreset.addPresets(`${pluginPath}/presets`)
		)

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
							this.disposables
					  )
					: undefined
			),
		])
	}

	deactivate() {
		this.disposables.forEach(disposable => disposable.dispose())
		this._isActive = false
	}

	setIsGlobal(val: boolean) {
		this._isGlobal = val
	}

	get version() {
		return this.manifest.version
	}
	get isGlobal() {
		return this._isGlobal
	}

	forStore(extensionStore: ExtensionStoreWindow) {
		const viewer = new ExtensionViewer(extensionStore, this.manifest)
		viewer.setInstalled()
		return viewer
	}
}
