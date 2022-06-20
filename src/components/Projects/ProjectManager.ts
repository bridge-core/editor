import { App } from '/@/App'
import { get as idbGet, set as idbSet } from 'idb-keyval'
import { shallowReactive, set, del, reactive } from '@vue/composition-api'
import { Signal } from '/@/components/Common/Event/Signal'
import { Project, virtualProjectName } from './Project/Project'
import { RecentProjects } from './RecentProjects'
import { Title } from '/@/components/Projects/Title'
import { editor } from 'monaco-editor'
import { BedrockProject } from './Project/BedrockProject'
import { InitialSetup } from '../InitialSetup/InitialSetup'
import { EventDispatcher } from '../Common/Event/EventDispatcher'
import { AnyDirectoryHandle, AnyHandle } from '../FileSystem/Types'
import { latestFormatVersion } from './Project/Config'
import { FileSystem } from '../FileSystem/FileSystem'
import { CreateConfig } from './CreateProject/Files/Config'
import { getStableFormatVersion } from '../Data/FormatVersions'
import { v4 as uuid } from 'uuid'
import { ICreateProjectOptions } from './CreateProject/CreateProject'

export class ProjectManager extends Signal<void> {
	public readonly addedProject = new EventDispatcher<Project>()
	public readonly activatedProject = new EventDispatcher<Project>()
	public readonly recentProjects!: RecentProjects
	public readonly state: Record<string, Project> = shallowReactive({})
	public readonly title = Object.freeze(new Title())
	protected _selectedProject?: string = undefined
	public readonly projectReady = new Signal<void>()

	constructor(protected app: App) {
		super()
		this.loadProjects()

		this.recentProjects = <RecentProjects>(
			reactive(new RecentProjects(this.app, `data/recentProjects.json`))
		)

		// Once possible, scan recentProjects for projects which no longer exist
		this.once(() => {
			this.recentProjects.keep(
				(project) =>
					Object.values(this.state).findIndex(
						(currProject) =>
							currProject.projectData.path === project.path
					) > -1
			)
		})
	}

	get currentProject() {
		if (!this.selectedProject) return null
		return this.state[this.selectedProject]
	}
	get selectedProject() {
		return this._selectedProject
	}

	async getProjects() {
		await this.fired
		return Object.values(this.state)
	}
	async addProject(projectDir: AnyDirectoryHandle, isNewProject = true) {
		const project = new BedrockProject(this, this.app, projectDir)
		await project.loadProject()

		set(this.state, project.name, project)

		if (isNewProject) {
			await this.selectProject(project.name)
			this.addedProject.dispatch(project)
		}

		return project
	}
	async removeProject(projectName: string) {
		const project = this.state[projectName]
		if (!project) return
		del(this.state, projectName)
		await this.app.fileSystem.unlink(`projects/${projectName}`)

		this.recentProjects.remove(project.projectData)
	}

	protected async loadProjects() {
		await InitialSetup.ready.fired
		await this.app.fileSystem.fired
		await this.app.dataLoader.fired

		const directoryHandle = await this.app.fileSystem.getDirectoryHandle(
			'projects'
		)
		// Load existing projects
		for await (const handle of directoryHandle.values()) {
			if (handle.kind !== 'directory') continue

			await this.addProject(handle, false)
		}

		if (Object.keys(this.state).length === 0) {
			// Create a placeholder project (virtual project)
			await this.createVirtualProject()
		}

		this.dispatch()
	}

	async createVirtualProject() {
		const handle = await this.app.fileSystem.getDirectoryHandle(
			`projects/${virtualProjectName}`,
			{
				create: true,
			}
		)
		const fs = new FileSystem(handle)

		const createOptions: ICreateProjectOptions = {
			name: 'bridge',
			namespace: 'bridge',
			author: [],
			description: '',
			bpAsRpDependency: false,
			experimentalGameplay: {},
			icon: null,
			packs: [
				'behaviorPack',
				'resourcePack',
				'skinPack',
				'worldTemplate',
				'.bridge',
			],
			rpAsBpDependency: false,
			targetVersion: await getStableFormatVersion(this.app.dataLoader),
			useLangForManifest: false,
			uuids: {
				data: uuid(),
				resources: uuid(),
				skin_pack: uuid(),
				world_template: uuid(),
			},
		}

		await Promise.all(
			['BP', 'RP', 'WT', 'SP'].map((folder) => fs.mkdir(folder))
		)

		await new CreateConfig().create(fs, createOptions)

		await this.addProject(handle, false)
	}

	async selectProject(projectName: string) {
		if (this.state[projectName] === undefined)
			throw new Error(
				`Cannot select project "${projectName}" because it no longer exists`
			)
		const app = await App.getApp()

		this.currentProject?.deactivate()
		this._selectedProject = projectName
		App.eventSystem.dispatch('disableValidation', null)
		this.currentProject?.activate()

		if (this.currentProject)
			await this.recentProjects.add(this.currentProject.projectData)
		await idbSet('selectedProject', projectName)

		app.themeManager.updateTheme()
		App.eventSystem.dispatch('projectChanged', this.currentProject!)

		if (!this.projectReady.hasFired) this.projectReady.dispatch()
	}
	async selectLastProject() {
		await this.fired
		await this.selectProject(virtualProjectName)
	}

	updateAllEditorOptions(options: editor.IEditorConstructionOptions) {
		Object.values(this.state).forEach((project) =>
			project.tabSystems.forEach((tabSystem) =>
				tabSystem.updateOptions(options)
			)
		)
	}

	/**
	 *  Call a function for every current project and projects newly added in the future
	 */
	forEachProject(func: (project: Project) => Promise<void> | void) {
		Object.values(this.state).forEach(func)

		return this.addedProject.on(func)
	}
	/**
	 * Call a function for every project that gets activated
	 */
	onActiveProject(func: (project: Project) => Promise<void> | void) {
		if (this.projectReady.hasFired && this.currentProject)
			func(this.currentProject)

		return this.activatedProject.on(func)
	}

	async recompileAll(forceStartIfActive = true) {
		for (const project of Object.values(this.state))
			await project.recompile(forceStartIfActive)
	}
}
