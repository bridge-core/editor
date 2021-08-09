import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
import CreateProjectComponent from './CreateProject.vue'
import { CreatePack } from './Packs/Pack'
import { CreateBP } from './Packs/BP'
import { CreateRP } from './Packs/RP'
import { CreateSP } from './Packs/SP'
import { CreateBridge } from './Packs/Bridge'
import { IPackType, PackType, TPackTypeId } from '/@/components/Data/PackType'
import { CreateGitIgnore } from './Files/GitIgnore'
import { CreateWT } from './Packs/WT'
import { CreateConfig } from './Files/Config'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { exportAsBrproject } from '../Export/AsBrproject'

export interface ICreateProjectOptions {
	author: string
	description: string
	icon: File | null
	name: string
	namespace: string
	targetVersion: string
	packs: (TPackTypeId | '.bridge')[]
	scripting: boolean
	gameTest: boolean
	rpAsBpDependency: boolean
	rpUuid?: string
	useLangForManifest: boolean
}
export class CreateProjectWindow extends BaseWindow {
	protected isFirstProject = false
	protected createOptions: ICreateProjectOptions = this.getDefaultOptions()
	protected isCreatingProject = false
	protected availableTargetVersions: string[] = []
	protected availableTargetVersionsLoading = true
	protected packs: Record<TPackTypeId | '.bridge', CreatePack> = {
		behaviorPack: new CreateBP(),
		resourcePack: new CreateRP(),
		skinPack: new CreateSP(),
		worldTemplate: new CreateWT(),
		'.bridge': new CreateBridge(),
	}
	protected availablePackTypes: IPackType[] = []
	protected createFiles = [new CreateGitIgnore(), new CreateConfig()]

	constructor() {
		super(CreateProjectComponent, false)
		this.defineWindow()

		App.ready.once(async (app) => {
			await app.dataLoader.fired
			this.availableTargetVersions = (
				await app.dataLoader.readJSON(
					'data/packages/minecraftBedrock/formatVersions.json'
				)
			).reverse()
			// Set default version
			this.createOptions.targetVersion = this.availableTargetVersions[0]
			this.availableTargetVersionsLoading = false
		})

		PackType.ready.once(() => {
			// TODO: Remove filter for world templates as soon as we support creating them
			this.availablePackTypes = PackType.all()
		})
	}

	get hasRequiredData() {
		return (
			this.createOptions.packs.length > 1 &&
			this.createOptions.name.length > 0 &&
			this.createOptions.namespace.length > 0 &&
			this.createOptions.author.length > 0 &&
			this.createOptions.targetVersion.length > 0
		)
	}

	open(isFirstProject = false) {
		this.isFirstProject = isFirstProject
		super.open()
	}

	async createProject() {
		const app = await App.getApp()

		// Ask user whether we should save the current project
		if (isUsingFileSystemPolyfill && !this.isFirstProject) {
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
		let previousProject: string | undefined
		if (!this.isFirstProject) previousProject = app.project.name

		await app.projectManager.addProject(projectDir)
		await app.extensionLoader.installFilesToCurrentProject()

		if (isUsingFileSystemPolyfill && !this.isFirstProject)
			await app.projectManager.removeProject(previousProject!)

		this.createOptions = this.getDefaultOptions()

		await App.audioManager.playAudio('confirmation_002.ogg', 1)
	}

	static getDefaultOptions(): ICreateProjectOptions {
		return {
			author: '',
			description: '',
			icon: null,
			name: '',
			namespace: 'bridge',
			targetVersion: '',
			packs: ['.bridge', 'behaviorPack', 'resourcePack'],
			scripting: false,
			gameTest: false,
			rpAsBpDependency: false,
			useLangForManifest: false,
		}
	}
	getDefaultOptions(): ICreateProjectOptions {
		return {
			...CreateProjectWindow.getDefaultOptions(),
			targetVersion: this.availableTargetVersions
				? this.availableTargetVersions[0]
				: '',
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
				packs: config.packs ?? [
					'.bridge',
					'behaviorPack',
					'resourcePack',
				],
				scripting:
					config.capabilities?.includes('scriptingAPI') ?? false,
				gameTest: config.capabilities?.includes('gameTestAPI') ?? false,
				useLangForManifest: false,
				rpAsBpDependency: false,
			}
		} catch {
			return this.getDefaultOptions()
		}
	}
}
