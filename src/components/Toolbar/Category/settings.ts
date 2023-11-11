import { ToolbarButton } from '../ToolbarButton'
import { App } from '/@/App'

export function setupSettingsButton(app: App) {
	App.toolbar.add(
		new ToolbarButton(
			'mdi-cog',
			'actions.settings.name',
			() => {
				app.windows.settings.open()
			},
			{ value: true }
		)
	)
}
