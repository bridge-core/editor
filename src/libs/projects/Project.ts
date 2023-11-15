import { basename, join } from '/@/libs/path'
import { App } from '/@/App'

export interface ProjectData {
	name: string
	icon: string
}

export async function validProject(path: string) {
	const fileSystem = App.instance.fileSystem

	return (
		(await fileSystem.exists(join(path, 'config.json'))) &&
		(await fileSystem.exists(join(path, 'BP', 'pack_icon.png')))
	)
}

export async function getData(path: string): Promise<ProjectData> {
	const fileSystem = App.instance.fileSystem

	return {
		name: basename(path),
		icon: await fileSystem.readFileDataUrl(
			join(path, 'BP', 'pack_icon.png')
		),
	}
}
