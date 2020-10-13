import { NotificationStore } from './state'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'
import { Disposable } from '@/types/disposable'

export interface Notification {
	icon?: string
	message?: string
	color?: string
	textColor?: string
	disposeOnMiddleClick?: boolean

	onClick?: () => void
	onMiddleClick?: () => void
}

export interface TimedNotification extends Notification {
	expiration: number

	onExpired?: () => void
}

/**
 * Creates a new notification
 * @param config
 */
export function createNotification(config: Notification): Disposable {
	if (!config.onClick)
		config.onClick = () => {
			//
		}
	const notificationUUID = uuid()
	Vue.set(NotificationStore, notificationUUID, {
		...config,
		onMiddleClick: () => {
			config.onMiddleClick?.()
			if (config.disposeOnMiddleClick)
				Vue.delete(NotificationStore, notificationUUID)
		},
	})

	return {
		dispose: () => {
			Vue.delete(NotificationStore, notificationUUID)
		},
	}
}

/**
 * Creates a new timed notification
 * @param config
 */
export function createTimedNotification(config: TimedNotification): Disposable {
	const notification = createNotification(config)

	setTimeout(() => {
		notification.dispose()
		if (config.onExpired) config.onExpired()
	}, config.expiration - Date.now())

	return {
		...notification,
	}
}

export function clearAllNotifications() {
	for (const [key] of Object.entries(NotificationStore)) {
		Vue.delete(NotificationStore, key)
	}
}
