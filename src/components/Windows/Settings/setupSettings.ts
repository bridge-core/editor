import { App } from '@/App'
import { ButtonToggle } from './Controls/ButtonToggle/ButtonToggle'
import { Toggle } from './Controls/Toggle/Toggle'
import { settingsState, SettingsWindow } from './SettingsWindow'

export function setupSettings(settings: SettingsWindow) {
	settings.addControl(
		new Toggle({
			category: 'appearance',
			title: 'Dark Mode',
			description: 'Toggles between dark and light app appearance.',
			key: 'isDarkMode',
			onChange: val => {
				console.log(val, settingsState)
				// App.instance.themeManager.apply()
			},
		})
	)

	settings.addControl(
		new ButtonToggle({
			category: 'developers',
			title: 'Simulate OS',
			description:
				'Simulate a different OS for testing platform specific behavior.',
			key: 'simulateOS',
			options: ['auto', 'win32', 'darwin', 'linux'],
			default: 'auto',
		})
	)
	settings.addControl(
		new Toggle({
			category: 'developers',
			title: 'Dev Mode',
			description: 'Enable the developer mode for this app.',
			key: 'isDevMode',
		})
	)

	settings.addControl(
		new Toggle({
			category: 'general',
			title: 'Dev Mode',
			description: 'Enable the developer mode for this app.',
			key: 'isDevMode',
		})
	)
}
