import { App } from '/@/App'

export function setupSettingsButton(app: App) {
	App.toolbar.add({
		type: 'button',
		id: 'openSettings',
		name: 'actions.settings.name',
		trigger() {
			app.windows.settings.open()
		},
		shouldRender: { value: true },
	})
}
