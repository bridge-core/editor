import { NotificationStore } from './state'
import { INotificationConfig, Notification } from './Notification'

/**
 * Creates a new notification
 * @param config
 */
export function createNotification(config: INotificationConfig) {
	return new Notification(config)
}

export function clearAllNotifications() {
	// @ts-expect-error
	if (typeof navigator.clearAppBadge === 'function') navigator.clearAppBadge()

	for (const key of Object.keys(NotificationStore)) {
		delete NotificationStore[key]
	}
}
