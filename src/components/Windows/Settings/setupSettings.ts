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
			title: 'Developer Mode',
			description: 'Enable the developer mode for this app.',
			key: 'isDevMode',
		})
	)

	settings.addControl(
		new Toggle({
			category: 'general',
			title: 'Collaborative Mode',
			description:
				'Forces full refresh of the cache upon switching projects. Disable when you work alone and you only use bridge. to edit your project.',
			key: 'fullLightningCacheRefresh',
			default: true,
		})
	)
	settings.addControl(
		new Toggle({
			category: 'general',
			title: 'Pack Spider',
			description:
				'Pack Spider connects files inside of your projects and presents the connections to you in a virtual file system.',
			key: 'enablePackSpider',
			default: true,
		})
	)
}
