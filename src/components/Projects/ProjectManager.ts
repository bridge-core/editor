import { App } from '/@/App'
import { get, set } from 'idb-keyval'
import Vue from 'vue'
import { Signal } from '/@/components/Common/Event/Signal'
import { Project } from './Project/Project'
import { RecentProjects } from './RecentProjects'
import { Title } from '/@/components/Projects/Title'

export class ProjectManager extends Signal<void> {
	public readonly recentProjects!: RecentProjects
	public readonly state: Record<string, Project> = {}
	public readonly title = new Title()
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
		return Object.values(this.state).map((project) => project.projectData)
	}
	async addProject(projectDir: FileSystemDirectoryHandle, select = true) {
		const project = new Project(this, this.app, projectDir)
		await project.loadProject()

		Vue.set(this.state, project.name, project)

		if (select) await this.selectProject(project.name)
	}
	async removeProject(projectName: string) {
		const project = this.state[projectName]
		if (!project) return

		await project.deactivate()
		Vue.delete(this.state, projectName)
		await this.app.fileSystem.unlink(`projects/${projectName}`)

		this.recentProjects.remove(project.projectData)
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

		const loadProjects = <FileSystemDirectoryHandle[]>(
			potentialProjects.filter(({ kind }) => kind === 'directory')
		)

		if (loadProjects.length === 0) {
			// Force creation of new project
			const createProject = this.app.windows.createProject
			createProject.open(true)
			await createProject.fired
		} else {
			// Load existing projects
			for (const projectDir of loadProjects) {
				await this.addProject(projectDir, false)
			}
		}

		this.dispatch()
	}

	async selectProject(projectName: string) {
		if (this.state[projectName] === undefined)
			throw new Error(
				`Cannot select project "${projectName}" because it no longer exists`
			)

		this.currentProject?.deactivate()
		this._selectedProject = projectName
		App.eventSystem.dispatch('disableValidation', null)
		this.currentProject?.activate()

		if (this.currentProject)
			await this.recentProjects.add(this.currentProject.projectData)
		await set('selectedProject', projectName)
		await this.app.switchProject(this.currentProject!)
	}
	async selectLastProject(app: App) {
		await this.fired
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
			await this.selectProject(projectName)
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
