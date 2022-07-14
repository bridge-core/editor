import { App } from '/@/App'
import { IProjectData } from '/@/components/Projects/Project/Project'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
import { Sidebar, SidebarItem } from '/@/components/Windows/Layout/Sidebar'
import ProjectChooserComponent from './ProjectChooser.vue'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { v4 as uuid } from 'uuid'
import { IExperimentalToggle } from '../CreateProject/CreateProject'
import { importNewProject } from '../Import/ImportNew'
import { IPackData } from '/@/components/Projects/Project/loadPacks'
import { ComMojangProjectLoader } from '../../OutputFolders/ComMojang/ProjectLoader'
import { markRaw } from '@vue/composition-api'

export class ProjectChooserWindow extends BaseWindow {
	protected sidebar = new Sidebar([])
	protected currentProject?: string = undefined
	protected experimentalToggles: (IExperimentalToggle & {
		isActive: boolean
	})[] = []
	protected showLoadAllButton: boolean | 'isLoading' = false

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

	async loadAllProjects() {
		this.showLoadAllButton = 'isLoading'
		const app = await App.getApp()

		const wasSuccessful = await app.setupBridgeFolder()
		if (wasSuccessful) {
			await this.loadProjects()
			this.showLoadAllButton = false
		} else {
			this.showLoadAllButton = true
		}
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

		this.showLoadAllButton = !app.bridgeFolderSetup.hasFired

		const projects = await app.projectManager.getProjects()
		const experimentalToggles = await app.dataLoader.readJSON(
			'data/packages/minecraftBedrock/experimentalGameplay.json'
		)

		projects.forEach((project) =>
			this.addProject(project.projectData.path!, project.name, {
				...project.projectData,
				isLocalProject: project.isLocal,
				experimentalGameplay: experimentalToggles.map(
					(toggle: IExperimentalToggle) => ({
						isActive:
							project.config.get().experimentalGameplay?.[
								toggle.id
							] ?? false,
						...toggle,
					})
				),
			})
		)

		const comMojangProjects = await new ComMojangProjectLoader(
			app
		).loadProjects()
		comMojangProjects.forEach((project) =>
			this.addProject(`comMojang/${project.name}`, project.name, {
				name: project.name,
				imgSrc:
					project.packs.find((pack) => !!pack.packIcon)?.packIcon ??
					undefined,
				contains: <IPackData[]>project.packs
					.map((pack) => {
						const packType = App.packType.getFromId(pack.type)
						if (!packType) return undefined

						return <IPackData>{
							...packType,
							version: pack.manifest?.header?.version ?? [
								1,
								0,
								0,
							],
							packPath: pack.packPath,
							uuid: pack.uuid,
						}
					})
					.filter((packType) => !!packType),
				isLocalProject: false,
				isComMojangProject: true,
				project: markRaw(project),
			})
		)

		this.sidebar.setDefaultSelected(
			app.isNoProjectSelected
				? undefined
				: app.projectManager.selectedProject
		)
		return app.isNoProjectSelected
			? undefined
			: app.projectManager.selectedProject
	}

	async open() {
		this.currentProject = await this.loadProjects()
		super.open()
	}
}
