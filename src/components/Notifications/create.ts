import { NotificationStore } from './state'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'
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
	for (const [key] of Object.entries(NotificationStore)) {
		Vue.delete(NotificationStore, key)
	}
}
