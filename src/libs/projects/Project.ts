import { basename, join } from '/@/libs/path'
import { App } from '/@/App'
import { defaultPackPaths } from 'mc-project-core'

export interface ProjectData {
	name: string
	icon: string
}

export async function validProject(path: string) {
	const fileSystem = App.instance.fileSystem

	return await fileSystem.exists(join(path, 'config.json'))
}

export async function getData(path: string): Promise<ProjectData> {
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
