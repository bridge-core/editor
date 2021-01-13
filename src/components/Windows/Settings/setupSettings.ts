import { App } from '@/App'
import { Toggle } from './Controls/Toggle'
import { settingsState, SettingsWindow } from './SettingsWindow'

export function setupSettings(settings: SettingsWindow) {
	settings.addControl(
		'appearance',
		new Toggle(
			'Dark Mode',
			'Toggles between dark and light app appearance.',
			'isDarkMode'
			// val => {
			// 	console.log(val)
			// 	App.instance.themeManager.apply()
			// }
		)
	)
}
