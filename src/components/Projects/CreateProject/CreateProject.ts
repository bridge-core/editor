import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
import CreateProjectComponent from './CreateProject.vue'
import { CreatePack, TPackType } from './Packs/Pack'
import { CreateBP } from './Packs/BP'
import { CreateRP } from './Packs/RP'
import { CreateSP } from './Packs/SP'
import { CreateBridge } from './Packs/Bridge'
import { IPackType, PackType } from '/@/components/Data/PackType'
import { CreateGitIgnore } from './Files/GitIgnore'
import { CreateWT } from './Packs/WT'
import { CreateConfig } from './Files/Config'

export interface ICreateProjectOptions {
	author: string
	description: string
	icon: File | null
	name: string
	namespace: string
	targetVersion: string
	packs: TPackType[]
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
	protected packs: Record<TPackType, CreatePack> = {
		BP: new CreateBP(),
		RP: new CreateRP(),
		SP: new CreateSP(),
		WT: new CreateWT(),
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

		await app.projectManager.addProject(projectDir)
		await app.extensionLoader.installFilesToCurrentProject()

		this.createOptions = this.getDefaultOptions()

		await App.audioManager.playAudio('confirmation_002.ogg', 1)
	}

	getDefaultOptions(): ICreateProjectOptions {
		return {
			author: '',
			description: '',
			icon: null,
			name: '',
			namespace: 'bridge',
			targetVersion: this.availableTargetVersions
				? this.availableTargetVersions[0]
				: '',
			packs: ['.bridge', 'BP', 'RP'],
			scripting: false,
			gameTest: false,
			rpAsBpDependency: false,
			useLangForManifest: false,
		}
	}
}
