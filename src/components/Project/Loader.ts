import { App } from '@/App'
import { PackType, IPackType } from '@/components/Data/PackType'
import { loadAsDataURL } from '@/utils/loadAsDataUrl'
import { get, set } from 'idb-keyval'

export interface IProjectData {
	path: string
	projectName: string
	imgSrc: string
	contains: IPackType[]
}

export let selectedProject: string
export async function getProjects() {
	const app = await App.getApp()

	const potentialProjects = await app.fileSystem.readdir('projects', {
		withFileTypes: true,
	})
	const loadProjects = potentialProjects
		.filter(({ kind }) => kind === 'directory')
		.map(({ name }) => name)

	const projects: IProjectData[] = []
	for (const projectName of loadProjects) {
		let config: any
		try {
			config = await app.fileSystem.readJSON(
				`projects/${projectName}/bridge/config.json`
			)
		} catch {
			config = {}
		}

		projects.push({
			...config,
			path: projectName,
			projectName,
			imgSrc: await loadAsDataURL(
				`projects/${projectName}/bridge/packIcon.png`
			),
			contains: <IPackType[]>(
				(await app.fileSystem.readdir(`projects/${projectName}`))
					.map(path =>
						PackType.get(`projects/${projectName}/${path}`)
					)
					.filter(pack => pack !== undefined)
			),
		})
	}

	return projects
}

export async function selectProject(projectName: string) {
	selectedProject = projectName
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

	if (typeof projectName === 'string') {
		selectedProject = projectName
		await app.switchProject(projectName)
	} else {
		throw new Error(`Expected string, found ${typeof projectName}`)
	}
}

async function loadFallback() {
	const fallback = (await getProjects())[0].path
	await set('selectedProject', fallback)
	return fallback
}
