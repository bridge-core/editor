import { appLocalDataDir, join } from '@tauri-apps/api/path'
import { get } from 'idb-keyval'

export async function getBridgeFolderPath() {
	if (!import.meta.env.VITE_IS_TAURI_APP)
		throw new Error(`This function is only available in Tauri apps.`)

	const configuredPath = await get<string | undefined>('bridgeFolderPath')
	console.log(configuredPath)
	if (configuredPath) return configuredPath

	return await join(await appLocalDataDir(), 'bridge')
}
