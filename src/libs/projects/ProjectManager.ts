import { EventSystem } from '/@/libs/event/EventSystem'
import { App } from '/@/App'
import { ProjectData, getData, validProject } from './Project'
import { join } from '/@/libs/path'
import { PWAFileSystem } from '../fileSystem/PWAFileSystem'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { CreateProjectConfig } from './CreateProjectConfig'
import { Ref, ref } from 'vue'
import { BehaviourPack } from './create/packs/BehaviorPack'
import { BridgePack } from './create/packs/Bridge'
import { Pack } from './create/packs/Pack'
import { ResourcePack } from './create/packs/ResourcePack'
import { SkinPack } from './create/packs/SkinPack'

export const Packs: {
	[key: string]: Pack | undefined
} = {
	'.bridge': new BridgePack(),
	behaviorPack: new BehaviourPack(),
	resourcePack: new ResourcePack(),
	skinPack: new SkinPack(),
}

export class ProjectManager {
	public projects: ProjectData[] = []
	public eventSystem = new EventSystem(['updatedProjects'])

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
				const pack = Packs[packId]

				if (pack === undefined) return

				await pack.create(fileSystem, projectPath, config)
			})
		)

		this.addProject(await getData(projectPath))
	}

	//TODO: Remove listeners on unmount
	public useProjects(): Ref<ProjectData[]> {
		const projects: Ref<ProjectData[]> = ref([])

		const me = this

		function updateProjects() {
			projects.value = [...me.projects]
		}

		this.eventSystem.on('updatedProjects', updateProjects)

		return projects
	}
}
