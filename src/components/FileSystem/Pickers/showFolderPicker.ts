import { VirtualDirectoryHandle } from '../Virtual/DirectoryHandle'

interface IOpenFolderOpts {
	multiple?: boolean
	defaultPath?: string
}

export async function showFolderPicker({
	defaultPath,
	multiple,
}: IOpenFolderOpts = {}) {
	if (!import.meta.env.VITE_IS_TAURI_APP) {
		if (multiple)
			console.warn(
				'Multiple folder selection is not supported in the browser yet'
			)

		const handle = await window
			.showDirectoryPicker({ multiple: false, mode: 'readwrite' })
			.catch(() => null)
		return handle ? [handle] : null
	}

	const { TauriFsStore } = await import('../Virtual/Stores/TauriFs')
	const { open } = await import('@tauri-apps/api/dialog')
	const { basename } = await import('@tauri-apps/api/path')

	let selectedPath = await open({
		directory: true,
		multiple,
		defaultPath,
	}).catch(() => null)
	if (!selectedPath) return null
	if (!Array.isArray(selectedPath)) selectedPath = [selectedPath]

	return await Promise.all(
		selectedPath.map(
			async (path) =>
				new VirtualDirectoryHandle(
					new TauriFsStore(path),
					await basename(path)
				)
		)
	)
}
