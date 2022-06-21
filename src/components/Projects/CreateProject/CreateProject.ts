import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
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
import { Project } from '../Project/Project'

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
}
export interface IExperimentalToggle {
	name: string
	id: string
	description: string
}
export class CreateProjectWindow extends BaseWindow {
	protected isFirstProject = false
	protected createOptions: ICreateProjectOptions = this.getDefaultOptions()
	protected isCreatingProject = false
	protected availableTargetVersions: string[] = []
	protected availableTargetVersionsLoading = true
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
	protected createFiles = [new CreateGitIgnore(), new CreateConfig()]
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
			this.availableTargetVersionsLoading = false

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

	open(isFirstProject = false) {
		this.createOptions = this.getDefaultOptions()

		this.isFirstProject = isFirstProject
		this.packCreateFiles.forEach(
			(createFile) => (createFile.isActive = true)
		)

		super.open()
	}

	async createProject() {
		const app = await App.getApp()

		// Ask user whether we should save the current project
		if (isUsingFileSystemPolyfill.value && !this.isFirstProject) {
			const confirmWindow = new ConfirmationWindow({
				description: 'windows.createProject.saveCurrentProject',
				cancelText: 'general.no',
				confirmText: 'general.yes',
			})
			if (await confirmWindow.fired) {
				await exportAsBrproject()
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

		// Save previous project name to delete it later
		let previousProject: Project | undefined
		if (!this.isFirstProject) previousProject = app.project

		await app.projectManager.addProject(projectDir)
		await app.extensionLoader.installFilesToCurrentProject()

		if (isUsingFileSystemPolyfill.value && !this.isFirstProject)
			await app.projectManager.removeProject(previousProject!)

		// Reset options
		this.createOptions = this.getDefaultOptions()
	}

	static getDefaultOptions(): ICreateProjectOptions {
		return {
			author:
				<string | undefined>settingsState?.projects?.defaultAuthor ??
				'',
			description: '',
			icon: null,
			name: '',
			namespace: 'bridge',
			targetVersion: '',
			packs: ['.bridge', 'behaviorPack', 'resourcePack'],
			rpAsBpDependency: false,
			bpAsRpDependency: false,
			useLangForManifest: false,
			experimentalGameplay: {},
			uuids: {},
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
			}
		} catch {
			return this.getDefaultOptions()
		}
	}
}
