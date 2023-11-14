import { EventSystem } from '/@/libs/event/EventSystem'
import { App } from '/@/App'

export class ProjectManager {
	public projects: string[] = []
	public eventSystem = new EventSystem(['updatedProjects'])

	public async loadProjects() {
		const fileSystem = App.instance.fileSystem

		if (!(await fileSystem.exists('projects')))
			await fileSystem.makeDirectory('projects')

		let items = await fileSystem.readDirectory('projects')

		this.projects = items

		this.eventSystem.dispatch('updatedProjects', null)
	}
}
