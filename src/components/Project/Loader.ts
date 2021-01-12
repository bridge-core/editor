import { App } from '@/App'
import { get, set } from 'idb-keyval'

export function getProjects() {
	return new Promise<string[]>(resolve => {
		App.ready.once(async app => {
			const potentialProjects = await app.fileSystem.readdir('projects', {
				withFileTypes: true,
			})

			resolve(
				potentialProjects
					.filter(({ kind }) => kind === 'directory')
					.map(({ name }) => name)
			)
		})
	})
}

export async function selectProject(projectName: string) {
	await set('selectedProject', projectName)
	await App.instance.switchProject(projectName)
}

export async function selectLastProject() {
	const projectName = await get('selectedProject')
	if (typeof projectName === 'string')
		return await App.instance.switchProject(projectName)

	const projects = await getProjects()
	await App.instance.switchProject(projects[0])
}
