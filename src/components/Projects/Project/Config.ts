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

/**
 * Internal config format versions
 *
 * Format version data:
 * [bridge. v2.2.8] Unset or "0": Projects may not contain the formatVersionCorrection compiler plugin
 * [bridge. v2.2.9] "1": Configs were upgraded to add the plugin
 */

export const latestFormatVersion = 1

export class ProjectConfig extends BaseProjectConfig {
	constructor(
		protected fileSystem: FileSystem,
		projectPath: string,
		protected project?: Project
	) {
		super(projectPath)

		if (project) {
			project.fileSave.on(
				this.resolvePackPath(undefined, 'config.json'),
				() => {
					this.refreshConfig()
					this.project!.app.windows.createPreset.onPresetsChanged()
					this.project!.compilerService.reloadPlugins()
				}
			)
		}
	}

	readConfig() {
		return this.fileSystem.readJSON(`config.json`).catch(() => ({}))
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

		const formatVersion = this.data.bridge?.formatVersion ?? 0
		if (!this.data.bridge) this.data.bridge = {}
		let updatedConfig = false

		// Running in main thread, so we can use the App object
		if (upgradeConfig && this.project && this.data.capabilities) {
			// Transform old "capabilities" format to "experimentalGameplay"
			const experimentalToggles: IExperimentalToggle[] =
				await this.project.app.dataLoader.readJSON(
					'data/packages/minecraftBedrock/experimentalGameplay.json'
				)
			const experimentalGameplay: Record<string, boolean> =
				this.data.experimentalGameplay ?? {}
			const capabilities: string[] = this.data.capabilities ?? []

			// Update scripting API/GameTest API toggles based on the old "capabilities" field
			experimentalGameplay['enableGameTestFramework'] =
				capabilities.includes('gameTestAPI')
			experimentalGameplay['additionalModdingCapabilities'] =
				capabilities.includes('scriptingAPI')

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

		if (
			upgradeConfig &&
			(await this.fileSystem.fileExists('.bridge/compiler/default.json'))
		) {
			const compilerConfig = await this.fileSystem.readJSON(
				'.bridge/compiler/default.json'
			)
			this.data.compiler = { plugins: compilerConfig.plugins }
			await this.fileSystem.unlink('.bridge/compiler/default.json')
			updatedConfig = true
		}

		if (
			upgradeConfig &&
			formatVersion === 0 &&
			this.data.compiler?.plugins &&
			!this.data.compiler.plugins.includes('formatVersionCorrection')
		) {
			this.data.bridge.formatVersion = 1
			this.data.compiler.plugins.push('formatVersionCorrection')
			updatedConfig = true
		}

		if (updatedConfig) await this.writeConfig(this.data)
	}

	async getWorldHandles() {
		if (!this.project)
			throw new Error(
				`Cannot use getWorldHandles() within web workers yet`
			)

		const app = this.project.app
		const globPatterns = (this.get().worlds ?? ['./worlds/*']).map((glob) =>
			this.resolvePackPath(undefined, glob)
		)

		return (
			await Promise.all(
				globPatterns.map((glob) =>
					app.fileSystem.getDirectoryHandlesFromGlob(glob)
				)
			)
		).flat()
	}

	getAuthorImage() {
		const author = <{ logo: string; name: string } | undefined>(
			this.get().authors?.find(
				(author) => typeof author !== 'string' && author.logo
			)
		)
		if (!author) return

		return this.resolvePackPath(undefined, author.logo)
	}

	async toggleExperiment(project: Project, experiment: string) {
		project.app.windows.loadingWindow.open()

		const experimentalGameplay = this.get()?.experimentalGameplay ?? {}
		// Modify experimental gameplay
		experimentalGameplay[experiment] = !experimentalGameplay[experiment]
		// Save config
		await this.save()

		// Only refresh project if it's active
		if (project.isActiveProject) await project.refresh()
		this.project!.app.windows.createPreset.onPresetsChanged()

		project.app.windows.loadingWindow.close()
	}
}
