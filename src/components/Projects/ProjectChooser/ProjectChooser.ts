import { App } from '/@/App'
import { IProjectData } from '/@/components/Projects/Project/Project'
import { Sidebar, SidebarItem } from '/@/components/Windows/Layout/Sidebar'
import ProjectChooserComponent from './ProjectChooser.vue'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { v4 as uuid } from 'uuid'
import { IExperimentalToggle } from '../CreateProject/CreateProject'
import { importNewProject } from '../Import/ImportNew'
import { IPackData } from '/@/components/Projects/Project/loadPacks'
import { ComMojangProjectLoader } from '../../OutputFolders/ComMojang/ProjectLoader'
import { markRaw, reactive } from 'vue'
import { IWindowState, NewBaseWindow } from '../../Windows/NewBaseWindow'

export interface IProjectChooserState extends IWindowState {
	showLoadAllButton: 'isLoading' | boolean
	currentProject?: string
}

export class ProjectChooserWindow extends NewBaseWindow {
	protected sidebar = new Sidebar([])
	protected experimentalToggles: (IExperimentalToggle & {
		isActive: boolean
	})[] = []

	protected state: IProjectChooserState = reactive<any>({
		...super.getState(),
		showLoadAllButton: false,
		currentProject: undefined,
	})

	constructor() {
		super(ProjectChooserComponent, false, true)

		this.state.actions.push(
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

		this.defineWindow()
	}

	async loadAllProjects() {
		this.state.showLoadAllButton = 'isLoading'
		const app = await App.getApp()

		const wasSuccessful = await app.setupBridgeFolder()
		const wasComMojangSuccesful = await app.comMojang.setupComMojang()

		if (wasSuccessful || wasComMojangSuccesful) {
			await this.loadProjects()
			this.state.showLoadAllButton =
				!wasSuccessful || !wasComMojangSuccesful
		} else {
			this.state.showLoadAllButton = true
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

		this.state.showLoadAllButton = !app.bridgeFolderSetup.hasFired

		const projects = await app.projectManager.getProjects()
		const experimentalToggles = await app.dataLoader.readJSON(
			'data/packages/minecraftBedrock/experimentalGameplay.json'
		)

		projects.forEach((project) =>
			this.addProject(project.projectData.path!, project.displayName, {
				displayName: project.displayName,
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
				displayName: project.name,
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
								1, 0, 0,
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
		this.state.currentProject = await this.loadProjects()
		super.open()
	}
}
