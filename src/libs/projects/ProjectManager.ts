import { EventSystem } from '/@/libs/event/EventSystem'
import { App } from '/@/App'
import { ProjectData, getData, validProject } from './Project'
import { join } from '/@/libs/path'
import { PWAFileSystem } from '../fileSystem/PWAFileSystem'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'
import { createBehaviourPack } from './create/packs/BehaviourPack'
import { createBridgePack } from './create/packs/Bridge'
import { createResourcePack } from './create/packs/ResourcePack'
import { createConfig } from './create/files/Config'
import { CreateProjectConfig } from './CreateProjectConfig'

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

		await createConfig(fileSystem, join(projectPath, 'config.json'), config)

		await createBridgePack(fileSystem, projectPath)

		if (config.packs.find((pack: any) => pack.id === 'behaviorPack'))
			await createBehaviourPack(fileSystem, projectPath, config)

		if (config.packs.find((pack: any) => pack.id === 'resourcePack'))
			await createResourcePack(fileSystem, projectPath, config)

		this.addProject(await getData(projectPath))
	}
}
