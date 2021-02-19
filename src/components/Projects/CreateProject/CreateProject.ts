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

export interface ICreateProjectOptions {
	author: string
	description: string
	icon: File | null
	name: string
	prefix: string
	targetVersion: string
	packs: TPackType[]
}
export class CreateProjectWindow extends BaseWindow {
	protected isFirstProject = false
	protected createOptions: ICreateProjectOptions = {
		author: '',
		description: '',
		icon: null,
		name: '',
		prefix: 'bridge',
		targetVersion: '',
		packs: ['bridge', 'BP', 'RP'],
	}
	protected isCreatingProject = false
	protected availableTargetVersions: string[] = []
	protected availableTargetVersionsLoading = true
	protected packs: Record<TPackType, CreatePack> = {
		BP: new CreateBP(),
		RP: new CreateRP(),
		SP: new CreateSP(),
		bridge: new CreateBridge(),
	}
	protected availablePackTypes: IPackType[] = []
	protected createFiles = [new CreateGitIgnore()]

	constructor() {
		super(CreateProjectComponent, false)
		this.defineWindow()

		App.ready.once(async app => {
			this.availableTargetVersions = await app.fileSystem.readJSON(
				'data/packages/formatVersions.json'
			)
			// Set default version
			this.createOptions.targetVersion = this.availableTargetVersions[
				this.availableTargetVersions.length - 1
			]
			this.availableTargetVersionsLoading = false
		})

		PackType.ready.once(() => {
			// TODO: Remove filter for world templates as soon as we support creating them
			this.availablePackTypes = PackType.all().filter(
				({ id }) => id !== 'worldTemplate'
			)
		})
	}

	get hasRequiredData() {
		return (
			this.createOptions.name.length > 0 &&
			this.createOptions.prefix.length > 0 &&
			this.createOptions.author.length > 0 &&
			this.createOptions.targetVersion.length > 0
		)
	}

	open(isFirstProject = false) {
		this.isFirstProject = isFirstProject
		super.open()
	}

	createProject() {
		return new Promise<void>(resolve =>
			App.ready.once(async app => {
				const fs = app.fileSystem
				const projectDir = await fs.getDirectoryHandle(
					`projects/${this.createOptions.name}`,
					{ create: true }
				)
				const scopedFs = new FileSystem(projectDir)

				for (const createFile of this.createFiles) {
					await createFile.create(scopedFs, this.createOptions)
				}
				for (const pack of this.createOptions.packs) {
					await this.packs[pack].create(scopedFs, this.createOptions)
				}

				await app.projectManager.addProject(projectDir)
				resolve()
			})
		)
	}
}
