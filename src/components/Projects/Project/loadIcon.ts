import { loadAsDataURL } from '@/utils/loadAsDataUrl'

export async function loadIcon(projectPath: string) {
	try {
		return await loadAsDataURL(`${projectPath}/BP/pack_icon.png`)
	} catch {}
	try {
		return await loadAsDataURL(`${projectPath}/RP/pack_icon.png`)
	} catch {}
	try {
		return await loadAsDataURL(`${projectPath}/SP/pack_icon.png`)
	} catch {}
}
