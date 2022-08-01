import { Extension } from './Extension'
import { ExtensionLoader } from './ExtensionLoader'
import { App } from '/@/App'

export class GlobalExtensionLoader extends ExtensionLoader {
	constructor(protected app: App) {
		super(
			app.fileSystem,
			'~local/extensions',
			'data/inactiveExtensions.json',
			true
		)
	}

	async getInstalledExtensions() {
		await this.app.projectManager.projectReady.fired

		return new Set([
			...(await super.getInstalledExtensions()).values(),
			...(
				await this.app.project.extensionLoader.getInstalledExtensions()
			).values(),
		])
	}

	mapActive<T>(cb: (ext: Extension) => T) {
		const res: T[] = this.app.project.extensionLoader.mapActive<T>(cb)

		for (const ext of this._extensions.values()) {
			if (ext.isActive) res.push(cb(ext))
		}

		return res
	}

	installFilesToCurrentProject() {
		return Promise.all(
			[...this.extensions.values()].map((ext) =>
				ext.installFilesToCurrentProject()
			)
		)
	}

	async reload() {
		this.disposeAll()
		this.loadExtensions()
	}
}
