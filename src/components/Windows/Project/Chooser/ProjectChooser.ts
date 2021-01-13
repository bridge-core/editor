import { App } from '@/App'
import { getProjects } from '@/components/Project/Loader'
import { createWindow } from '@/components/Windows/create'
import { Sidebar, SidebarItem } from '@/components/Windows/Layout/Sidebar'
import { get } from 'idb-keyval'
import ProjectChooserComponent from './ProjectChooser.vue'

export class ProjectChooserWindow {
	protected sidebar = new Sidebar([])
	protected window?: any

	addProject(id: string, name: string, icon: string) {
		this.sidebar.addElement(
			new SidebarItem({
				color: 'primary',
				text: name,
				icon,
				id,
			})
		)
		this.sidebar.setDefaultSelected()
	}

	async loadProjects() {
		this.sidebar.removeElements()

		const projects = await getProjects()
		const selectedProject: string = await get('selectedProject')
		projects.forEach(project =>
			this.addProject(project, project, 'mdi-circle-outline')
		)
		console.log(selectedProject)
		this.sidebar.setDefaultSelected(selectedProject ?? projects[0])
	}

	open() {
		this.window = createWindow(ProjectChooserComponent, {
			sidebar: this.sidebar,
		})
		this.window.open()
		this.loadProjects()
	}
	close() {
		this.window.close()
	}
}
