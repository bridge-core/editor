// import { createErrorNotification } from '@/appCycle/Errors'

export function platform() {
	const platform = navigator.platform.toLowerCase()
	if (platform.includes('win')) return 'win32'
	else if (platform.includes('linux')) return 'linux'
	else if (platform.includes('mac')) return 'darwin'

	// Breaks vue components \_o_/
	// createErrorNotification(new Error(`Unknown platform: ${platform}`))
}
