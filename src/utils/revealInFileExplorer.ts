export async function revealInFileExplorer(path: string) {
	if (!import.meta.env.VITE_IS_TAURI_APP)
		throw new Error('This action is only available on Tauri builds')

	const { invoke } = await import('@tauri-apps/api/tauri')

	await invoke('reveal_in_file_explorer', {
		path,
	})
}
