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
	protected comMojangProjectLoader

	protected state: IProjectChooserState = reactive<any>({
		...super.getState(),
		showLoadAllButton: false,
		currentProject: undefined,
	})

	constructor(app: App) {
		super(ProjectChooserComponent, false, true)

		this.state.actions.push(
			new SimpleAction({
				icon: 'mdi-refresh',
				name: 'general.reload',
				color: 'accent',
				isDisabled: () => this.state.isLoading,
				onTrigger: () => {
					this.reload()
				},
			}),
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
		this.comMojangProjectLoader = markRaw(new ComMojangProjectLoader(app))

		this.defineWindow()
	}

	async loadAllProjects() {
		this.state.showLoadAllButton = 'isLoading'
		const app = await App.getApp()

		// Only request permission if the user didn't already grant it
		const wasSuccessful =
			app.bridgeFolderSetup.hasFired || (await app.setupBridgeFolder())
		// For the com.mojang folder, we additionally check that bridge. already has its handle stored in IDB
		const wasComMojangSuccesful = app.comMojang.hasComMojangHandle
			? app.comMojang.hasFired || (await app.comMojang.setupComMojang())
			: true

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

		// Show the loadAllButton if the user didn't grant permissions to bridge folder or comMojang folder yet
		this.state.showLoadAllButton =
			!app.bridgeFolderSetup.hasFired ||
			(!app.comMojang.setup.hasFired && app.comMojang.hasComMojangHandle)

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

		console.time('Load com.mojang projects')
		const comMojangProjects =
			await this.comMojangProjectLoader.loadProjects()
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
		console.timeEnd('Load com.mojang projects')

		this.sidebar.resetSelected()
		if (app.isNoProjectSelected) this.sidebar.setDefaultSelected()
		else this.sidebar.setDefaultSelected(app.projectManager.selectedProject)

		return app.projectManager.selectedProject
	}

	async reload() {
		this.state.isLoading = true

		this.comMojangProjectLoader.clearCache()
		await this.loadProjects()

		this.state.isLoading = false
	}

	async open() {
		super.open()

		this.state.isLoading = true
		console.time('Load projects')
		this.state.currentProject = await this.loadProjects()
		console.timeEnd('Load projects')
		this.state.isLoading = false
	}
}
