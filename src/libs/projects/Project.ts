import { basename, join } from '/@/libs/path'
import { App } from '/@/App'
import { defaultPackPaths } from 'mc-project-core'
import { ProjectData } from '../data/ProjectData'

export interface ProjectInfo {
	name: string
	icon: string
}

export class Project {
	public path: string
	public icon: string | null = null

	constructor(public name: string, public data: ProjectData) {
		this.path = join('projects', this.name)
	}

	public async load() {
		this.icon = (await getProjectInfo(join('projects', this.name))).icon

		await this.data.load()
	}
}

export async function validProject(path: string) {
	const fileSystem = App.instance.fileSystem

	return await fileSystem.exists(join(path, 'config.json'))
}

export async function getProjectInfo(path: string): Promise<ProjectInfo> {
	const fileSystem = App.instance.fileSystem

	let iconDataUrl =
		'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

	if (
		await fileSystem.exists(
			join(path, defaultPackPaths['behaviorPack'], 'pack_icon.png')
		)
	)
		iconDataUrl = await fileSystem.readFileDataUrl(
			join(path, 'BP', 'pack_icon.png')
		)

	if (
		await fileSystem.exists(
			join(path, defaultPackPaths['resourcePack'], 'pack_icon.png')
		)
	)
		iconDataUrl = await fileSystem.readFileDataUrl(
			join(path, 'BP', 'pack_icon.png')
		)

	if (
		await fileSystem.exists(
			join(path, defaultPackPaths['skinPack'], 'pack_icon.png')
		)
	)
		iconDataUrl = await fileSystem.readFileDataUrl(
			join(path, 'BP', 'pack_icon.png')
		)

	return {
		name: basename(path),
		icon: iconDataUrl,
	}
}
