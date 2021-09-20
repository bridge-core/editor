import { App } from '/@/App'
import { IProjectData } from '/@/components/Projects/Project/Project'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
import { Sidebar, SidebarItem } from '/@/components/Windows/Layout/Sidebar'
import ProjectChooserComponent from './ProjectChooser.vue'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { v4 as uuid } from 'uuid'
import { importFromBrproject } from '../Import/fromBrproject'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { IExperimentalToggle } from '../CreateProject/CreateProject'
import { importFromMcaddon } from '../Import/fromMcaddon'
import { importNewProject } from '../Import/ImportNew'

export class ProjectChooserWindow extends BaseWindow {
	protected sidebar = new Sidebar([])
	protected currentProject?: string = undefined
	protected experimentalToggles: (IExperimentalToggle & {
		isActive: boolean
	})[] = []

	constructor() {
		super(ProjectChooserComponent, false, true)
		this.defineWindow()

		this.actions.push(
			new SimpleAction({
				icon: 'mdi-import',
				name: 'actions.importBrproject.name',
				color: 'accent',
				onTrigger: () => {
					this.close()
					importNewProject()
				},
			}),
			new SimpleAction({
				icon: 'mdi-plus',
				name: 'windows.projectChooser.newProject.name',
				color: 'accent',
				onTrigger: async () => {
					const app = await App.getApp()
					this.close()
					app.windows.createProject.open()
				},
			})
		)
	}

	addProject(id: string, name: string, project: Partial<IProjectData>) {
		this.sidebar.addElement(
			new SidebarItem({
				color: 'primary',
				text: name ?? 'Unknown',
				icon: `mdi-alpha-${name[0].toLowerCase()}-box-outline`,
				id: id ?? uuid(),
			}),
			project
		)
		this.sidebar.setDefaultSelected()
	}

	async loadProjects() {
		this.sidebar.removeElements()
		const app = await App.getApp()

		const projects = await app.projectManager.getProjects()

		const experimentalToggles = await app.dataLoader.readJSON(
			'data/packages/minecraftBedrock/experimentalGameplay.json'
		)

		projects.forEach((project) =>
			this.addProject(project.path!, project.name!, {
				...project,
				experimentalGameplay: experimentalToggles.map(
					(toggle: IExperimentalToggle) => ({
						isActive:
							app.projectConfig.get().experimentalGameplay?.[
								toggle.id
							] ?? false,
						...toggle,
					})
				),
			})
		)
		this.sidebar.setDefaultSelected(app.projectManager.selectedProject)
		return app.projectManager.selectedProject
	}

	async open() {
		this.currentProject = await this.loadProjects()
		super.open()
	}
}
