import { App } from '@/App'
import { IProjectData } from '@/components/Projects/Project/Project'
import { createWindow } from '@/components/Windows/create'
import { Sidebar, SidebarItem } from '@/components/Windows/Layout/Sidebar'
import ProjectChooserComponent from './ProjectChooser.vue'

export class ProjectChooserWindow {
	protected sidebar = new Sidebar([])
	protected window?: any

	addProject(id: string, name: string, project: IProjectData) {
		this.sidebar.addElement(
			new SidebarItem({
				color: 'primary',
				text: name,
				icon: `mdi-alpha-${name[0].toLowerCase()}-box-outline`,
				id,
			}),
			project
		)
		this.sidebar.setDefaultSelected()
	}

	async loadProjects() {
		this.sidebar.removeElements()
		const app = await App.getApp()

		const projects = await app.projectManager.getProjects()

		projects.forEach(project =>
			this.addProject(project.path, project.name, project)
		)
		this.sidebar.setDefaultSelected(app.projectManager.selectedProject)
		return app.projectManager.selectedProject
	}

	async open() {
		const currentProject = await this.loadProjects()

		this.window = createWindow(ProjectChooserComponent, {
			sidebar: this.sidebar,
			currentProject,
			window: this,
		})
		this.window.open()
	}
	close() {
		this.window.close()
	}
}
