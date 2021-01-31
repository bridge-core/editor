import { IDisposable } from '@/types/disposable'
import { FileSystem } from '../FileSystem/Main'
import { createErrorNotification } from '@/components/Notifications/Errors'
import { ExtensionLoader, IExtensionManifest } from './ExtensionLoader'
import { loadUIComponents } from './UI/load'
import { createUIStore } from './UI/store'
import { App } from '@/App'

export class Extension {
	protected _isActive = false
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
		console.log(pluginPath)

		this.disposables.push(
			app.windows.createPreset.addPresets(`${pluginPath}/presets`)
		)

		await Promise.all([
			loadUIComponents(this.fileSystem, this.uiStore, this.disposables),
		])
	}

	deactivate() {
		this.disposables.forEach(disposable => disposable.dispose())
		this._isActive = false
	}
}
