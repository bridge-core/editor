import type { Project } from './Project'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'

export async function loadIcon(project: Project, fileSystem: FileSystem) {
	try {
		return await loadAsDataURL(
			project.config.resolvePackPath('behaviorPack', 'pack_icon.png'),
			fileSystem
		)
	} catch {}
	try {
		return await loadAsDataURL(
			project.config.resolvePackPath('resourcePack', 'pack_icon.png'),
			fileSystem
		)
	} catch {}
	try {
		return await loadAsDataURL(
			project.config.resolvePackPath('skinPack', 'pack_icon.png'),
			fileSystem
		)
	} catch {}
}
