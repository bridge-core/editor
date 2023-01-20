import { get } from 'idb-keyval'

let cachedPath: string | undefined = undefined

export async function getBridgeFolderPath() {
	if (!import.meta.env.VITE_IS_TAURI_APP)
		throw new Error(`This function is only available in Tauri apps.`)
	if (cachedPath) return cachedPath

	const { appLocalDataDir, join } = await import('@tauri-apps/api/path')

	const configuredPath = await get<string | undefined>('bridgeFolderPath')
	if (configuredPath) {
		cachedPath = configuredPath
		return cachedPath
	}

	cachedPath = await join(await appLocalDataDir(), 'bridge')
	return cachedPath
}
