import type { Project } from './Project'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'

export async function loadIcon(project: Project, fileSystem: FileSystem) {
	try {
		return await loadAsDataURL(
			project.getFilePath('behaviorPack', 'pack_icon.png'),
			fileSystem
		)
	} catch {}
	try {
		return await loadAsDataURL(
			project.getFilePath('resourcePack', 'pack_icon.png'),
			fileSystem
		)
	} catch {}
	try {
		return await loadAsDataURL(
			project.getFilePath('skinPack', 'pack_icon.png'),
			fileSystem
		)
	} catch {}
}
