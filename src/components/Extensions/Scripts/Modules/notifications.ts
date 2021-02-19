import { IModuleConfig } from '../types'
import { INotificationConfig } from '/@/components/Notifications/Notification'
import { createNotification } from '/@/components/Notifications/create'
import { createErrorNotification } from '/@/components/Notifications/Errors'

export const NotificationModule = ({ disposables }: IModuleConfig) => ({
	create(config: INotificationConfig) {
		const notification = createNotification(config)
		disposables.push(notification)
		return notification
	},
	createError(error: Error) {
		const notification = createErrorNotification(error)
		disposables.push(notification)
		return notification
	},
})
