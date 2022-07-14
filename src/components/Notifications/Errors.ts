import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { App } from '/@/App'
import { createNotification } from '/@/components/Notifications/create'
import { IDisposable } from '/@/types/disposable'

function getStackTrace(error: Error) {
	let stack = error.stack ?? 'at unknown'

	let stackArr = stack.split('\n').map((line) => line.trim())
	return stackArr.splice(stackArr[0].startsWith('Error') ? 1 : 0)
}

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

	const notification = createNotification({
		id: message,
		icon: 'mdi-alert-circle-outline',
		message: `[${short}]`,
		color: 'error',
		textColor: 'white',
		disposeOnMiddleClick: true,
		onClick: () => {
			new InformationWindow({
				name: `[ERROR: ${short}]`,
				description: `[${error.message} (${getStackTrace(error)})]`,
			})
			notification.dispose()
		},
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
