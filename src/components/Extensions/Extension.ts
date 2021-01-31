import { IDisposable } from '@/types/disposable'
import { FileSystem } from '../FileSystem/Main'
import { createErrorNotification } from '@/components/Notifications/Errors'
import { ExtensionLoader, IExtensionManifest } from './ExtensionLoader'
import { loadUIComponents } from './UI/load'
import { createUIStore } from './UI/store'

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

		await loadUIComponents(this.fileSystem, this.uiStore, this.disposables)
	}

	deactivate() {
		this.disposables.forEach(disposable => disposable.dispose())
		this._isActive = false
	}
}
