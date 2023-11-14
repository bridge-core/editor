import { EventSystem } from '/@/libs/event/EventSystem'
import { App } from '/@/App'
import { ProjectData, getData, validProject } from './Project'
import pathBrowserify from 'path-browserify'

export class ProjectManager {
	public projects: ProjectData[] = []
	public eventSystem = new EventSystem(['updatedProjects'])

	public async loadProjects() {
		const fileSystem = App.instance.fileSystem

		if (!(await fileSystem.exists('projects')))
			await fileSystem.makeDirectory('projects')

		let items = await fileSystem.readDirectoryEntries('projects')

		const foldersToLoad = items
			.filter((item) => item.type === 'directory')
			.map((item) => item.path)

		this.projects = []

		for (const folderName of foldersToLoad) {
			const projectPath = pathBrowserify.join('projects', folderName)
			if (!(await validProject(projectPath))) continue

			this.projects.push(await getData(projectPath))
		}

		this.eventSystem.dispatch('updatedProjects', null)
	}
}
