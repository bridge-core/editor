import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import CreateProjectComponent from './CreateProject.vue'
import { CreatePack } from './Packs/Pack'
import { CreateBP } from './Packs/BP'
import { CreateRP } from './Packs/RP'
import { CreateSP } from './Packs/SP'
import { CreateBridge } from './Packs/Bridge'
import { IPackType, TPackTypeId } from '/@/components/Data/PackType'
import { CreateGitIgnore } from './Files/GitIgnore'
import { CreateWT } from './Packs/WT'
import { CreateConfig } from './Files/Config'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { exportAsBrproject } from '../Export/AsBrproject'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { CreateWorlds } from './Packs/worlds'
import {
	getFormatVersions,
	getStableFormatVersion,
} from '/@/components/Data/FormatVersions'
import { CreateDenoConfig } from './Files/DenoConfig'
import { IWindowState, NewBaseWindow } from '../../Windows/NewBaseWindow'
import { reactive } from 'vue'

export interface ICreateProjectOptions {
	author: string | string[]
	description: string
	icon: File | null
	name: string
	namespace: string
	targetVersion: string
	packs: (TPackTypeId | '.bridge')[]
	rpAsBpDependency: boolean
	bpAsRpDependency: boolean
	uuids: {
		resources?: string
		data?: string
		skin_pack?: string
		world_template?: string
	}
	useLangForManifest: boolean
	experimentalGameplay: Record<string, boolean>
	bdsProject: boolean
}
export interface IExperimentalToggle {
	name: string
	id: string
	description: string
}

export interface ICreateProjectState extends IWindowState {
	isCreatingProject: boolean
	createOptions: ICreateProjectOptions
	availableTargetVersionsLoading: boolean
}
export class CreateProjectWindow extends NewBaseWindow {
	protected availableTargetVersions: string[] = []
	protected stableVersion: string = ''
	protected packs: Record<TPackTypeId | '.bridge' | 'worlds', CreatePack> = <
		const
	>{
		behaviorPack: new CreateBP(),
		resourcePack: new CreateRP(),
		skinPack: new CreateSP(),
		worldTemplate: new CreateWT(),
		'.bridge': new CreateBridge(),
		worlds: new CreateWorlds(),
	}
	protected availablePackTypes: IPackType[] = []
	protected createFiles = [
		new CreateGitIgnore(),
		new CreateConfig(),
		new CreateDenoConfig(),
	]
	protected experimentalToggles: IExperimentalToggle[] = []
	protected projectNameRules = [
		(val: string) =>
			val.match(/"|\\|\/|:|\||<|>|\*|\?|~/g) === null ||
			'windows.createProject.projectName.invalidLetters',
		(val: string) =>
			!val.endsWith('.') ||
			'windows.createProject.projectName.endsInPeriod',
		(val: string) =>
			val.trim() !== '' ||
			'windows.createProject.projectName.mustNotBeEmpty',
	]

	protected state: ICreateProjectState = reactive<any>({
		...super.getState(),
		isCreatingProject: false,
		createOptions: this.getDefaultOptions(),
		availableTargetVersionsLoading: true,
	})

	get createOptions() {
		return this.state.createOptions
	}

	get packCreateFiles() {
		return Object.entries(this.packs)
			.map(([packId, pack]) => {
				if (
					!this.createOptions.packs.includes(
						<TPackTypeId | '.bridge'>packId
					)
				)
					return []
				return pack.createFiles.map((createFile) =>
					Object.assign(createFile, { packId })
				)
			})
			.flat()
			.filter((createFile) => createFile.isConfigurable)
	}

	constructor() {
		super(CreateProjectComponent, false)
		this.defineWindow()

		App.ready.once(async (app) => {
			await app.dataLoader.fired
			this.availableTargetVersions = await getFormatVersions()
			// Set default version
			this.stableVersion = await getStableFormatVersion(app.dataLoader)
			this.createOptions.targetVersion = this.stableVersion
			this.state.availableTargetVersionsLoading = false

			this.experimentalToggles = await app.dataLoader.readJSON(
				'data/packages/minecraftBedrock/experimentalGameplay.json'
			)
			this.createOptions.experimentalGameplay = Object.fromEntries(
				this.experimentalToggles.map((toggle) => [toggle.id, false])
			)
		})

		App.packType.ready.once(() => {
			this.availablePackTypes = App.packType.all
		})
	}

	get hasRequiredData() {
		return (
			this.createOptions.packs.length > 1 &&
			this.projectNameRules.every(
				(rule) => rule(this.createOptions.name) === true
			) &&
			this.createOptions.namespace.length > 0 &&
			this.createOptions.author.length > 0 &&
			this.createOptions.targetVersion.length > 0
		)
	}

	open() {
		this.state.createOptions = this.getDefaultOptions()

		this.packCreateFiles.forEach(
			(createFile) => (createFile.isActive = true)
		)

		super.open()
	}

	async createProject() {
		const app = await App.getApp()

		const removeOldProject =
			isUsingFileSystemPolyfill.value && !app.hasNoProjects

		// Save previous project name to delete it later
		let previousProject = app.isNoProjectSelected
			? app.projects[0]
			: app.project

		// Ask user whether we should save the current project
		if (removeOldProject) {
			const confirmWindow = new ConfirmationWindow({
				description: 'windows.createProject.replaceCurrentProject',
				cancelText: 'general.no',
				confirmText: 'general.yes',
			})
			if (await confirmWindow.fired) {
				await exportAsBrproject(previousProject?.name)
			}
		}

		const fs = app.fileSystem
		const projectDir = await fs.getDirectoryHandle(
			`projects/${this.createOptions.name}`,
			{ create: true }
		)
		const scopedFs = new FileSystem(projectDir)

		// Create individual files without a pack
		for (const createFile of this.createFiles) {
			await createFile.create(scopedFs, this.createOptions)
		}

		// We need to ensure that we create the RP before the BP in order to link it up correctly inside of the BP manifest
		// if the user chose the corresponding option. This line sorts packs in reverse alphabetical order to achieve that
		const reversePacks = this.createOptions.packs.sort((a, b) =>
			b.localeCompare(a)
		)
		// Create the different packs
		for (const pack of reversePacks) {
			await this.packs[pack].create(scopedFs, this.createOptions)
		}

		await app.projectManager.addProject(
			projectDir,
			true,
			app.bridgeFolderSetup.hasFired
		)
		await app.extensionLoader.installFilesToCurrentProject()

		if (removeOldProject)
			await app.projectManager.removeProject(previousProject!)

		// Reset options
		this.state.createOptions = this.getDefaultOptions()
	}

	static getDefaultOptions(): ICreateProjectOptions {
		return {
			author:
				<string | undefined>settingsState?.projects?.defaultAuthor ===
				''
					? 'bridge.'
					: <string | undefined>(
							settingsState?.projects?.defaultAuthor
					  ) ?? 'bridge.',
			description: '',
			icon: null,
			name: 'New Project',
			namespace: 'bridge',
			targetVersion: '',
			packs: ['.bridge', 'behaviorPack', 'resourcePack'],
			rpAsBpDependency: false,
			bpAsRpDependency: false,
			useLangForManifest: false,
			experimentalGameplay: {},
			uuids: {},
			bdsProject: false,
		}
	}
	getDefaultOptions(): ICreateProjectOptions {
		return {
			...CreateProjectWindow.getDefaultOptions(),
			targetVersion: this.availableTargetVersions
				? this.stableVersion
				: '',
			experimentalGameplay: this.experimentalToggles
				? Object.fromEntries(
						this.experimentalToggles.map((toggle) => [
							toggle.id,
							false,
						])
				  )
				: {},
		}
	}

	static async loadFromConfig(): Promise<ICreateProjectOptions> {
		const app = await App.getApp()

		let config: any
		try {
			config = await app.project.fileSystem.readJSON('config.json')

			return {
				author: config.author ?? '',
				description: config.description ?? '',
				icon: null,
				name: config.name ?? '',
				namespace: config.namespace ?? 'bridge',
				targetVersion: config.targetVersion ?? '',
				packs: Object.values(config.packs) ?? [
					'.bridge',
					'behaviorPack',
					'resourcePack',
				],
				useLangForManifest: false,
				rpAsBpDependency: false,
				bpAsRpDependency: false,
				experimentalGameplay: config.experimentalGameplay ?? {},
				uuids: {},
				bdsProject: false,
			}
		} catch {
			return this.getDefaultOptions()
		}
	}
}
