import { App } from '/@/App'
import pathBrowserify from 'path-browserify'

export interface ProjectData {
	name: string
	img: string
}

export async function validProject(path: string) {
	const fileSystem = App.instance.fileSystem

	return (
		(await fileSystem.exists(pathBrowserify.join(path, 'config.json'))) &&
		(await fileSystem.exists(
			pathBrowserify.join(path, 'BP', 'pack_icon.png')
		))
	)
}

export async function getData(path: string): Promise<ProjectData> {
	const fileSystem = App.instance.fileSystem

	return {
		name: pathBrowserify.basename(path),
		img: await fileSystem.readFileDataUrl(
			pathBrowserify.join(path, 'BP', 'pack_icon.png')
		),
	}
}
