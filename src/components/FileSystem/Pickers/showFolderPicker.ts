import { VirtualDirectoryHandle } from '../Virtual/DirectoryHandle'
import { TauriFsStore } from '../Virtual/Stores/TauriFs'

interface IOpenFolderOpts {
	defaultPath?: string
}

export async function showFolderPicker({ defaultPath }: IOpenFolderOpts = {}) {
	if (!import.meta.env.VITE_IS_TAURI_APP)
		return await window
			.showDirectoryPicker({ multiple: false, mode: 'readwrite' })
			.catch(() => null)

	const { open } = await import('@tauri-apps/api/dialog')
	const { basename } = await import('@tauri-apps/api/path')

	const selectedPath = await open({
		directory: true,
		multiple: false,
		defaultPath,
	}).catch(() => null)
	if (!selectedPath || Array.isArray(selectedPath)) return null

	return new VirtualDirectoryHandle(
		new TauriFsStore(selectedPath),
		await basename(selectedPath)
	)
}
