import { App } from '/@/App'

export function setupDownloadButton(app: App) {
	App.toolbar.add({
		type: 'button',
		id: 'download',
		name: 'toolbar.download.name',
		trigger() {
			App.openUrl(
				'https://bridge-core.app/guide/download/',
				undefined,
				true
			)
		},
		shouldRender: { value: !import.meta.env.VITE_IS_TAURI_APP },
	})
}
