import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { IExperimentalToggle } from '../CreateProject/CreateProject'
import type { Project } from './Project'
import {
	defaultPackPaths,
	IConfigJson,
	ProjectConfig as BaseProjectConfig,
} from 'mc-project-core'

export type { IConfigJson } from 'mc-project-core'
export { defaultPackPaths } from 'mc-project-core'

export class ProjectConfig extends BaseProjectConfig {
	constructor(protected fileSystem: FileSystem, protected project?: Project) {
		super(`projects/${fileSystem.baseDirectory.name}`)

		if (project) {
			project.fileSave.on('config.json', () => {
				this.refreshConfig()
				this.project!.app.windows.createPreset.onPresetsChanged()
				this.project!.compilerService.reloadPlugins()
			})
		}
	}

	readConfig() {
		return this.fileSystem.readJSON(`config.json`)
	}
	async writeConfig(config: Partial<IConfigJson>) {
		await this.fileSystem.writeJSON(`config.json`, config, true)
	}

	async setup(upgradeConfig = true) {
		// Load legacy project config & transform it to new format specified here: https://github.com/bridge-core/project-config-standard
		if (
			upgradeConfig &&
			(await this.fileSystem.fileExists('.bridge/config.json'))
		) {
			const {
				darkTheme,
				lightTheme,
				gameTestAPI,
				scriptingAPI,
				prefix,
				...other
			} = await this.fileSystem.readJSON('.bridge/config.json')
			await this.fileSystem.unlink('.bridge/config.json')

			const experimentalGameplay: Record<string, boolean> = {}
			if (gameTestAPI)
				experimentalGameplay['enableGameTestFramework'] = true
			if (scriptingAPI)
				experimentalGameplay['additionalModdingCapabilities'] = true

			const newFormat = {
				type: 'minecraftBedrock',
				name: this.fileSystem.baseDirectory.name,
				namespace: prefix,
				experimentalGameplay,
				...other,
				authors: other.author ? [other.author] : ['Unknown'],
				packs: defaultPackPaths,
				bridge: {
					darkTheme,
					lightTheme,
				},
			}

			await this.fileSystem.writeJSON('config.json', newFormat, true)
			this.data = newFormat

			return
		}

		await super.setup()

		let updatedConfig = false

		// Running in main thread, so we can use the App object
		if (upgradeConfig && this.project && this.data.capabilities) {
			// Transform old "capabilities" format to "experimentalGameplay"
			const experimentalToggles: IExperimentalToggle[] = await this.project.app.dataLoader.readJSON(
				'data/packages/minecraftBedrock/experimentalGameplay.json'
			)
			const experimentalGameplay: Record<string, boolean> =
				this.data.experimentalGameplay ?? {}
			const capabilities: string[] = this.data.capabilities ?? []

			// Update scripting API/GameTest API toggles based on the old "capabilities" field
			experimentalGameplay[
				'enableGameTestFramework'
			] = capabilities.includes('gameTestAPI')
			experimentalGameplay[
				'additionalModdingCapabilities'
			] = capabilities.includes('scriptingAPI')

			for (const toggle of experimentalToggles) {
				// Set all missing experimental toggles to true by default
				experimentalGameplay[toggle.id] ??= true
			}
			this.data.experimentalGameplay = experimentalGameplay
			this.data.capabilities = undefined
			updatedConfig = true
		}

		// Support reading from old "author" field
		if (upgradeConfig && this.data.author && !this.data.authors) {
			this.data.authors =
				typeof this.data.author === 'string'
					? [this.data.author]
					: this.data.author
			this.data.author = undefined
			updatedConfig = true
		}

		if (updatedConfig) await this.writeConfig(this.data)
	}
}
