import { FileSystem } from '../FileSystem/FileSystem'
import { IExperimentalToggle } from './CreateProject/CreateProject'
import type { Project } from './Project/Project'
import { App } from '/@/App'

export interface IConfigJson {
	/**
	 * Defines the type of a project
	 */
	type: 'minecraftBedrock' | 'minecraftJava'

	/**
	 * The name of the project
	 */
	name: string

	/**
	 * Creator of the project
	 *
	 * @example "solvedDev" / "Joel ant 05"
	 */
	author: string

	/**
	 * The Minecraft version this project targets
	 *
	 * @example "1.17.0" / "1.16.220"
	 */
	targetVersion: string

	/**
	 * Experimental gameplay the project intends to use.
	 *
	 * @example { "cavesAndCliffs": true, "holidayCreatorFeatures": false }
	 */
	experimentalGameplay?: Record<string, boolean>

	/**
	 * The namespace used for the project. The namespace "minecraft" is not a valid string for this field.
	 *
	 * @example "my_project"
	 */
	namespace: string

	/**
	 * Maps the id of packs this project contains to a path relative to the config.json
	 *
	 * @example { "behaviorPack": "./BP", "resourcePack": "./RP" }
	 */
	packs: {
		[packId: string]: string
	}

	/**
	 * Allows users to define additional data which is hard to find for tools
	 * (e.g. scoreboards setup inside of a world)
	 *
	 * @example { "names": { "include": ["solvedDev"] } }
	 */
	packDefinitions: {
		families: IPackDefinition
		tags: IPackDefinition
		scoreboardObjectives: IPackDefinition
		names: IPackDefinition
	}

	/**
	 * Tools can create their own namespace inside of this file to save tool specific data and settings
	 *
	 * @example { "bridge": { "darkTheme": "bridge.default.dark", "lightTheme": "bridge.default.light" } }
	 */
	[uniqueToolId: string]: any

	bridge?: {
		lightTheme?: string
		darkTheme?: string
		v1CompatMode?: boolean
	}
}

interface IPackDefinition {
	/**
	 * Optional: Define e.g. the type of a scoreboard objective
	 *
	 * @example "dummy"
	 */
	type?: string
	/**
	 * Strings to exclude from a tool's collected data
	 */
	exclude: string[]
	/**
	 * String to add to a tool's collected data
	 */
	include: string[]
}

export class ProjectConfig {
	protected data: Partial<IConfigJson> = {}

	constructor(protected fileSystem: FileSystem, project?: Project) {
		if (project) {
			project.fileSave.on('config.json', () => {
				this.refreshConfig()
			})
		}
	}

	async setup() {
		// Load legacy project config & transform it to new format specified here: https://github.com/bridge-core/project-config-standard
		if (await this.fileSystem.fileExists('.bridge/config.json')) {
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
				packs: {
					behaviorPack: './BP',
					resourcePack: './RP',
					skinPack: './SP',
					worldTemplate: './WT',
				},
				bridge: {
					darkTheme,
					lightTheme,
				},
			}

			await this.fileSystem.writeJSON('config.json', newFormat, true)
			this.data = newFormat

			return
		}

		try {
			const config = await this.fileSystem.readJSON(`config.json`)

			// Transform old "capabilities" format to "experimentalGameplay"
			const app = await App.getApp()
			const experimentalToggles: IExperimentalToggle[] = await app.dataLoader.readJSON(
				'data/packages/minecraftBedrock/experimentalGameplay.json'
			)
			const experimentalGameplay: Record<string, boolean> =
				config.experimentalGameplay ?? {}
			const capabilities: string[] = config.capabilities ?? []

			for (const toggle of experimentalToggles) {
				// If GameTests and Scripting API weren't enabled on the project originally, set them to false
				if (!capabilities.includes('gameTestAPI'))
					experimentalGameplay['enableGameTestFramework'] = false
				if (!capabilities.includes('scriptingAPI'))
					experimentalGameplay[
						'additionalModdingCapabilities'
					] = false

				// Only change if it doesn't already exist
				if (!Object.keys(experimentalGameplay).includes(toggle.id)) {
					// Set all missing experimental toggles to true by default
					experimentalGameplay[toggle.id] = true
				}
			}
			config.experimentalGameplay = experimentalGameplay
			config.capabilities = undefined
			await this.fileSystem.writeJSON('config.json', config, true)
			this.data = config
		} catch {
			this.data = {}
		}
	}

	async refreshConfig() {
		try {
			this.data = await this.fileSystem.readJSON(`config.json`)
		} catch {
			this.data = {}
		}
	}

	get() {
		return this.data
	}

	async save() {
		await this.fileSystem.writeJSON(`config.json`, this.data, true)
	}
}
