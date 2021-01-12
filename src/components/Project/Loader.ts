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

export async function selectLastProject(app: App) {
	let projectName = await get('selectedProject')

	if (typeof projectName === 'string') {
		try {
			await app.fileSystem.getDirectoryHandle(`projects/${projectName}`)
		} catch {
			projectName = await loadFallback()
		}
	} else {
		projectName = await loadFallback()
	}

	await App.instance.switchProject(<string>projectName)
}

async function loadFallback() {
	const fallback = (await getProjects())[0]
	await set('selectedProject', fallback)
	return fallback
}
