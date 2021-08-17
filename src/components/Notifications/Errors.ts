import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { App } from '/@/App'
import { createNotification } from '/@/components/Notifications/create'
import { IDisposable } from '/@/types/disposable'

/**
 * Creates a new error notification
 * @param config
 */
export function createErrorNotification(error: Error): IDisposable {
	const message = error.message ?? ''
	let short = message
	if (message.includes(': ')) short = message.split(': ').shift() as string
	if (short.length > 24)
		short = message.length > 24 ? `${message.substr(0, 23)}...` : message

	App?.audioManager?.playAudio('error_002.ogg', 1)

	const notification = createNotification({
		icon: 'mdi-alert-circle-outline',
		message: `[${short}]`,
		color: 'error',
		textColor: 'white',
		disposeOnMiddleClick: true,
		onClick: () => {
			App.audioManager.playAudio('click5.ogg', 1)
			new InformationWindow({
				name: `[ERROR: ${short}]`,
				description: `[${message}]`,
			})
			notification.dispose()
		},
	})

	new InformationWindow({
		description: `[${error.message}]`,
		isPersistent: false,
		name: '[ERROR]',
	})

	return notification
}

window.addEventListener('error', (event) => {
	createErrorNotification(event.error ?? event)

	App?.ready?.once((app) => app.windows.loadingWindow.closeAll())
})

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
	createErrorNotification(new Error(event.reason))

	App?.ready?.once((app) => app.windows.loadingWindow.closeAll())
}
