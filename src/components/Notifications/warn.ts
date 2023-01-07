import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { createNotification } from './create'

export function emitWarning(title: string, message: string) {
	const notification = createNotification({
		color: 'warning',
		icon: 'mdi-alert',
		message: title,
		onClick: () => {
			notification.dispose()

			new InformationWindow({
				description: message,
				title: title,
			})
		},
	})
}
