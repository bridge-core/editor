import { Sidebar, SidebarItem } from '@/components/Windows/Layout/Sidebar'
import CreatePresetComponent from './CreatePreset.vue'
import { BaseWindow } from '../../BaseWindow'

export class CreatePresetWindow extends BaseWindow {
	protected sidebar = new Sidebar([])

	constructor() {
		super(CreatePresetComponent)
		this.defineWindow()
	}

	addProject(id: string, name: string) {
		// this.sidebar.addElement(
		// 	new SidebarItem({
		// 		color: 'primary',
		// 		text: name,
		// 		icon: `mdi-alpha-${name[0].toLowerCase()}-box-outline`,
		// 		id,
		// 	})
		// )
		// this.sidebar.setDefaultSelected()
	}

	async loadPresets() {
		// this.sidebar.removeElements()
		// const projects = await getProjects()
		// projects.forEach(project =>
		// 	this.addProject(project.path, project.projectName, project)
		// )
		// this.sidebar.setDefaultSelected(selectedProject)
		// return selectedProject
	}

	async open() {
		const currentProject = await this.loadPresets()
		super.open()
	}
}
