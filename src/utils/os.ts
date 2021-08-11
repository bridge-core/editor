// import { createErrorNotification } from '/@/appCycle/Errors'

import { settingsState } from '/@/components/Windows/Settings/SettingsState'

export function platform() {
	if (
		settingsState?.developers?.simulateOS &&
		settingsState.developers.simulateOS !== 'auto'
	)
		return <'win32' | 'linux' | 'darwin'>settingsState.developers.simulateOS

	const platform = navigator.platform.toLowerCase()
	if (platform.includes('win')) return 'win32'
	else if (platform.includes('linux')) return 'linux'
	else if (platform.includes('mac') || platform.includes('ipad'))
		return 'darwin'

	throw new Error(`Unknown platform: ${platform}`)

	// Breaks vue components \_o_/
	// createErrorNotification(new Error(`Unknown platform: ${platform}`))
}
