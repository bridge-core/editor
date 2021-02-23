import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'

export async function loadIcon(projectPath: string, fileSystem: FileSystem) {
	try {
		return await loadAsDataURL(
			`${projectPath}/BP/pack_icon.png`,
			fileSystem
		)
	} catch {}
	try {
		return await loadAsDataURL(
			`${projectPath}/RP/pack_icon.png`,
			fileSystem
		)
	} catch {}
	try {
		return await loadAsDataURL(
			`${projectPath}/SP/pack_icon.png`,
			fileSystem
		)
	} catch {}
}
