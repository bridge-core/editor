import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { IExperimentalToggle } from '../CreateProject/CreateProject'
import type { Project } from './Project'
import type { TPackTypeId } from '/@/components/Data/PackType'
import { resolve } from '/@/utils/path'

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
	 * @deprecated
	 * @example "solvedDev"
	 */
	author: string

	/**
	 * Creators of the project
	 *
	 * @example ["solvedDev", "Joel ant 05"]
	 */
	authors: string[]

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
	 * Additional capabilities the project wants to use
	 *
	 * @deprecated
	 * @example ["scriptingAPI", "gameTestAPI"]
	 */
	capabilities: string[]

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
		[packId in TPackTypeId]?: string
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

	compiler?: any
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

export const defaultPackPaths = <const>{
	behaviorPack: './BP',
	resourcePack: './RP',
	skinPack: './SP',
	worldTemplate: './WT',
}

export class ProjectConfig {
	protected data: Partial<IConfigJson> = {}

	constructor(protected fileSystem: FileSystem, protected project?: Project) {
		if (project) {
			project.fileSave.on('config.json', () => {
				this.refreshConfig()
				this.project!.app.windows.createPreset.onPresetsChanged()
			})
		}
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
			this.data = await this.fileSystem.readJSON(`config.json`)
		} catch {
			this.data = {}
		}

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
		if (this.data.author && !this.data.authors) {
			this.data.authors =
				typeof this.data.author === 'string'
					? [this.data.author]
					: this.data.author
			this.data.author = undefined
			updatedConfig = true
		}

		if (updatedConfig)
			await this.fileSystem.writeJSON('config.json', this.data, true)
	}

	async refreshConfig() {
		// Update this.data from config on disk
		try {
			this.data = await this.fileSystem.readJSON(`config.json`)
		} catch {
			this.data = {}
		}
	}

	get() {
		return this.data
	}

	getPackRoot(packId: TPackTypeId) {
		return this.data.packs?.[packId] ?? defaultPackPaths[packId]
	}
	resolvePackPath(packId?: TPackTypeId, filePath?: string) {
		const name = this.fileSystem.baseDirectory.name

		if (!filePath && !packId) return `projects/${name}`
		else if (!packId) return `projects/${name}/${filePath}`
		else if (!filePath)
			return resolve(`projects/${name}`, `${this.getPackRoot(packId)}`)

		return resolve(
			`projects/${name}`,
			`${this.getPackRoot(packId)}/${filePath}`
		)
	}
	getAvailablePackPaths() {
		const paths: string[] = []

		for (const packId of Object.keys(this.data.packs ?? {})) {
			paths.push(this.resolvePackPath(<TPackTypeId>packId))
		}

		return paths
	}

	async save() {
		await this.fileSystem.writeJSON(`config.json`, this.data, true)
	}
}
