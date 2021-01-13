import { App } from '@/App'
import { PackType, IPackType } from '@/appCycle/PackType'
import { loadAsDataURL } from '@/utils/loadAsDataUrl'
import { get, set } from 'idb-keyval'

export interface IProjectData {
	path: string
	projectName: string
	imgSrc: string
	contains: IPackType[]
}

export let selectedProject: string
export function getProjects() {
	return new Promise<IProjectData[]>(resolve => {
		App.ready.once(async app => {
			const potentialProjects = await app.fileSystem.readdir('projects', {
				withFileTypes: true,
			})

			const projects: IProjectData[] = []
			for (const projectName of potentialProjects
				.filter(({ kind }) => kind === 'directory')
				.map(({ name }) => name)) {
				projects.push({
					path: projectName,
					projectName,
					imgSrc: await loadAsDataURL(
						`projects/${projectName}/BP/pack_icon.png`
					),
					contains: <IPackType[]>(
						(
							await app.fileSystem.readdir(
								`projects/${projectName}`
							)
						)
							.map(path =>
								PackType.get(`projects/${projectName}/${path}`)
							)
							.filter(pack => pack !== undefined)
					),
				})
			}

			resolve(projects)
		})
	})
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
