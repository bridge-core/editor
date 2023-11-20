import { EventSystem } from '/@/libs/event/EventSystem'
import { App } from '/@/App'
import { Project, ProjectData, getData, validProject } from './Project'
import { join } from '/@/libs/path'
import { PWAFileSystem } from '../fileSystem/PWAFileSystem'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { CreateProjectConfig } from './CreateProjectConfig'
import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { BehaviourPack } from './create/packs/BehaviorPack'
import { BridgePack } from './create/packs/Bridge'
import { Pack } from './create/packs/Pack'
import { ResourcePack } from './create/packs/ResourcePack'
import { SkinPack } from './create/packs/SkinPack'
import { defaultPackPaths } from 'mc-project-core'

export const packs: {
	[key: string]: Pack | undefined
} = {
	bridge: new BridgePack(),
	behaviorPack: new BehaviourPack(),
	resourcePack: new ResourcePack(),
	skinPack: new SkinPack(),
}

export class ProjectManager {
	public projects: ProjectData[] = []
	public eventSystem = new EventSystem([
		'updatedProjects',
		'updatedCurrentProject',
	])
	public currentProject: Project | null = null

	public async loadProjects() {
		const fileSystem = App.instance.fileSystem

		if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) {
			this.projects = []

			this.eventSystem.dispatch('updatedProjects', null)

			return
		}

		if (!(await fileSystem.exists('projects')))
			await fileSystem.makeDirectory('projects')

		let items = await fileSystem.readDirectoryEntries('projects')

		const foldersToLoad = items
			.filter((item) => item.type === 'directory')
			.map((item) => item.path)

		this.projects = []

		for (const folderName of foldersToLoad) {
			const projectPath = join('projects', folderName)
			if (!(await validProject(projectPath))) continue

			this.projects.push(await getData(projectPath))
		}

		this.eventSystem.dispatch('updatedProjects', null)
	}

	private addProject(project: ProjectData) {
		this.projects.push(project)

		this.eventSystem.dispatch('updatedProjects', null)
	}

	public async createProject(
		config: CreateProjectConfig,
		fileSystem: BaseFileSystem
	) {
		const projectPath = join('projects', config.name)

		await fileSystem.makeDirectory(projectPath)

		await Promise.all(
			config.packs.map(async (packId: string) => {
				const pack = packs[packId]

				if (pack === undefined) return

				await pack.create(
					fileSystem,
					projectPath,
					config,
					join(
						projectPath,
						defaultPackPaths[
							packId as keyof typeof defaultPackPaths
						] ?? '.bridge/'
					)
				)
			})
		)

		this.addProject(await getData(projectPath))
	}

	public async loadProject(name: string) {
		this.currentProject = new Project(name)

		await this.currentProject.load()

		this.eventSystem.dispatch('updatedCurrentProject', null)
	}

	public useProjects(): Ref<ProjectData[]> {
		const projects: Ref<ProjectData[]> = ref(this.projects)

		const me = this

		function updateProjects() {
			projects.value = [...me.projects]
		}

		onMounted(() => me.eventSystem.on('updatedProjects', updateProjects))
		onUnmounted(() => me.eventSystem.off('updatedProjects', updateProjects))

		return projects
	}

	public useCurrentProject(): Ref<Project | null> {
		const currentProject: Ref<Project | null> = ref(this.currentProject)

		const me = this

		function updateCurrentProject() {
			currentProject.value = me.currentProject
		}

		onMounted(() =>
			me.eventSystem.on('updatedCurrentProject', updateCurrentProject)
		)
		onUnmounted(() =>
			me.eventSystem.off('updatedCurrentProject', updateCurrentProject)
		)

		return currentProject
	}
}
