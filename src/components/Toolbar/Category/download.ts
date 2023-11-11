import { vuetify } from '../../App/Vuetify'
import { ToolbarButton } from '../ToolbarButton'
import { App } from '/@/App'

export function setupDownloadButton(app: App) {
	App.toolbar.add(
		new ToolbarButton(
			'mdi-download',
			'toolbar.download.name',
			() => {
				App.openUrl(
					'https://bridge-core.app/guide/download/',
					undefined,
					true
				)
			},
			{ value: !import.meta.env.VITE_IS_TAURI_APP }
		)
	)
}
