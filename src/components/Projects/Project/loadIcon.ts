import { TPackTypeId } from 'mc-project-core'
import type { Project } from './Project'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'

export async function loadIcon(project: Project, fileSystem: FileSystem) {
	const config = project.config

	const definedPacks = Object.values(config.getAvailablePacks())

	if (definedPacks.length === 0) return

	return await loadAsDataURL(
		project.config.resolvePackPath(
			<TPackTypeId>definedPacks[0],
			'pack_icon.png'
		),
		fileSystem
	).catch(() => undefined)
}
