import type { Project } from './Project'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import { join } from '/@/utils/path'

export async function loadIcon(project: Project, fileSystem: FileSystem) {
	const config = project.config

	const packPaths = Object.values(config.getAvailablePacks())

	if (packPaths.length === 0) return

	return await loadAsDataURL(
		join(packPaths[0], 'pack_icon.png'),
		fileSystem
	).catch(() => undefined)
}
