import { NotificationStore } from './state'
import { v4 as uuid } from 'uuid'
import { IDisposable } from '/@/types/disposable'
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

	for (const [key] of Object.entries(NotificationStore)) {
		delete NotificationStore[key]
	}
}
