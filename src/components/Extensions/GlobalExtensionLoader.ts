import { Extension } from './Extension'
import { ExtensionLoader } from './ExtensionLoader'
import { App } from '/@/App'

export class GlobalExtensionLoader extends ExtensionLoader {
	constructor(protected app: App) {
		super(app.fileSystem, 'data/inactiveExtensions.json', true)
	}

	async getInstalledExtensions() {
		return new Map([
			...(await super.getInstalledExtensions()).entries(),
			...(
				await this.app.project.extensionLoader.getInstalledExtensions()
			).entries(),
		])
	}

	mapActive<T>(cb: (ext: Extension) => T) {
		const res: T[] = this.app.project.extensionLoader.mapActive<T>(cb)

		for (const ext of this._extensions.values()) {
			if (ext.isActive) res.push(cb(ext))
		}

		return res
	}
}
