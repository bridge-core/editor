import { IDisposable } from '@/types/disposable'
import { FileSystem } from '../FileSystem/Main'
import { loadUIComponents } from './UI/load'
import { createUIStore, TUIStore } from './UI/store'

export class PluginLoader {
	constructor(protected fileSystem: FileSystem) {}

	async loadGlobalPlugins() {
		let pluginsToLoad: string[] = []
		try {
			pluginsToLoad.push(
				...(await this.fileSystem.readJSON('data/loadPlugins.json'))
			)
		} catch {}
	}

	async loadProjectPlugins(projectName: string) {
		let pluginsToLoad: string[] = []
		try {
			pluginsToLoad.push(
				...(await this.fileSystem.readJSON(
					`projects/${projectName}/bridge/loadPlugins.json`
				))
			)
		} catch {}
	}

	async loadPlugin(pluginPath: string) {
		let manifest: any
		try {
			manifest = await this.fileSystem.readJSON(
				`${pluginPath}/manifest.json`
			)
		} catch (e) {
			return
		}

		const uiStore = createUIStore()
		const disposables: IDisposable[] = []
		disposables.push(uiStore)

		await loadUIComponents(
			this.fileSystem,
			`${pluginPath}/UI`,
			uiStore,
			disposables
		)

		//LOAD PLUGIN
		if (manifest.id) {
			await Promise.all([
				this.loadScripts(`${pluginPath}/UI`, uiStore, disposables),
			])
		}
	}

	async loadScripts(
		pluginPath: string,
		uiStore: TUIStore,
		disposables: IDisposable[]
	) {}
}
