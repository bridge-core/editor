import { App } from '@/App'
import { get, set } from 'idb-keyval'
import Vue from 'vue'
import { Signal } from '@/components/Common/Event/Signal'
import { Project } from './Project/Project'
import { RecentProjects } from './RecentProjects'

export class ProjectManager extends Signal<void> {
	public readonly recentProjects!: RecentProjects
	public readonly state: Record<string, Project> = {}
	protected _selectedProject?: string = undefined

	constructor(protected app: App) {
		super()
		this.loadProjects()

		Vue.set(
			this,
			'recentProjects',
			new RecentProjects(this.app, `data/recentProjects.json`)
		)
	}

	get currentProject() {
		if (!this.selectedProject) return
		return this.state[this.selectedProject]
	}
	get selectedProject() {
		return this._selectedProject
	}

	async getProjects() {
		await this.fired
		return Object.values(this.state).map(project => project.projectData)
	}
	async addProject(projectName: string, select = true) {
		const project = new Project(this.app, projectName)
		await project.loadProject()

		Vue.set(this.state, projectName, project)

		if (select) await this.selectProject(projectName)
	}

	protected async loadProjects() {
		await this.app.fileSystem.fired
		await this.app.dataLoader.fired

		let potentialProjects: FileSystemHandle[] = []
		try {
			potentialProjects = await this.app.fileSystem.readdir('projects', {
				withFileTypes: true,
			})
		} catch {}

		const loadProjects = potentialProjects
			.filter(({ kind }) => kind === 'directory')
			.map(({ name }) => name)

		if (loadProjects.length === 0) {
			// Force creation of new project
			const createProject = this.app.windows.createProject
			createProject.open(true)
			await createProject.fired
		} else {
			// Load existing projects
			for (const projectName of loadProjects) {
				await this.addProject(projectName, false)
			}
		}

		this.dispatch()
	}

	async selectProject(projectName: string) {
		if (this.state[projectName] === undefined)
			throw new Error(
				`Cannot select project "${projectName}" because it no longer exists`
			)

		this.currentProject?.tabSystem.deactivate()
		this._selectedProject = projectName
		App.eventSystem.dispatch('disableValidation', null)

		if (this.currentProject)
			await this.recentProjects.add(this.currentProject.projectData)
		await set('selectedProject', projectName)
		await this.app.switchProject(projectName)
		this.currentProject?.tabSystem.activate()
	}
	async selectLastProject(app: App) {
		let projectName = await get('selectedProject')

		if (typeof projectName === 'string') {
			try {
				await app.fileSystem.getDirectoryHandle(
					`projects/${projectName}`
				)
			} catch {
				projectName = await this.loadFallback()
			}
		} else {
			projectName = await this.loadFallback()
		}

		if (typeof projectName === 'string') {
			this._selectedProject = projectName
			await app.switchProject(projectName)
		} else {
			throw new Error(`Expected string, found ${typeof projectName}`)
		}
	}
	protected async loadFallback() {
		await this.fired

		const fallback = Object.keys(this.state)[0]
		await set('selectedProject', fallback)
		return fallback
	}
}
