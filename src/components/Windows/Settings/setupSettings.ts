import { App } from '@/App'
import { ButtonToggle } from './Controls/ButtonToggle/ButtonToggle'
import { Toggle } from './Controls/Toggle/Toggle'
import { SettingsWindow } from './SettingsWindow'
import { settingsState } from './SettingsState'
import { ActionViewer } from './Controls/ActionViewer/ActionViewer'
import { Selection } from './Controls/Selection/Selection'

export async function setupSettings(settings: SettingsWindow) {
	settings.addControl(
		new ButtonToggle({
			category: 'appearance',
			name: 'Color Scheme',
			description: "Choose the color scheme of bridge.'s UI.",
			key: 'colorScheme',
			options: ['auto', 'dark', 'light'],
			default: 'auto',
			onChange: () => {
				App.getApp().then(app => app.themeManager.updateTheme())
			},
		})
	)
	settings.addControl(
		new Selection({
			category: 'appearance',
			name: 'Dark Theme',
			description: 'Select the default dark theme bridge. uses.',
			key: 'darkTheme',
			get options() {
				return settings.parent.themeManager
					.getThemes('dark')
					.map(theme => ({ text: theme.name, value: theme.id }))
			},
			default: 'bridge.default.dark',
			onChange: () => {
				App.getApp().then(app => app.themeManager.updateTheme())
			},
		})
	)
	settings.addControl(
		new Selection({
			category: 'appearance',
			name: 'Light Theme',
			description: 'Select the default light theme bridge. uses.',
			key: 'lightTheme',
			get options() {
				return settings.parent.themeManager
					.getThemes('light')
					.map(theme => ({ text: theme.name, value: theme.id }))
			},
			default: 'bridge.default.light',
			onChange: () => {
				App.getApp().then(app => app.themeManager.updateTheme())
			},
		})
	)
	settings.addControl(
		new Toggle({
			category: 'appearance',
			name: 'Sidebar Right',
			description: 'Moves the sidebar to the right side of the screen.',
			key: 'isSidebarRight',
			default: false,
		})
	)
	settings.addControl(
		new Toggle({
			category: 'appearance',
			name: 'Shrink Sidebar Elements',
			description: "Shrink the size of bridge.'s sidebar elements.",
			key: 'smallerSidebarElements',
			default: false,
		})
	)

	settings.addControl(
		new ButtonToggle({
			category: 'developers',
			name: 'Simulate OS',
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
			name: 'Developer Mode',
			description: 'Enable the developer mode for this app.',
			key: 'isDevMode',
		})
	)

	settings.addControl(
		new Toggle({
			category: 'general',
			name: 'Collaborative Mode',
			description:
				'Forces full refresh of the cache upon switching projects. Disable when you work alone and you only use bridge. to edit your project.',
			key: 'fullLightningCacheRefresh',
			default: true,
		})
	)
	settings.addControl(
		new Toggle({
			category: 'general',
			name: 'Pack Spider',
			description:
				'Pack Spider connects files inside of your projects and presents the connections to you in a virtual file system.',
			key: 'enablePackSpider',
			default: true,
		})
	)

	settings.addControl(
		new Toggle({
			category: 'general',
			name: 'Open Links in Default Browser',
			description:
				'Open links inside of your default browser instead of a native app window.',
			key: 'openLinksInBrowser',
			default: false,
		})
	)

	const app = await App.getApp()
	Object.values(app.actionManager.state).forEach(action => {
		settings.addControl(new ActionViewer(action))
	})
}
