import { NotificationStore } from './state'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'
import { IDisposable } from '@/types/disposable'

export interface INotification {
	icon?: string
	message?: string
	color?: string
	textColor?: string
	disposeOnMiddleClick?: boolean

	onClick?: () => void
	onMiddleClick?: () => void
}

/**
 * Creates a new notification
 * @param config
 */
export function createNotification(config: INotification): IDisposable {
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
	// @ts-expect-error
	if (typeof navigator.setAppBadge === 'function')
		// @ts-expect-error
		navigator.setAppBadge(Object.keys(NotificationStore).length)

	return {
		dispose: () => {
			Vue.delete(NotificationStore, notificationUUID)
			// @ts-expect-error
			if (typeof navigator.setAppBadge === 'function')
				// @ts-expect-error
				navigator.setAppBadge(Object.keys(NotificationStore).length)
		},
	}
}

export function clearAllNotifications() {
	// @ts-expect-error
	if (typeof navigator.clearAppBadge === 'function') navigator.clearAppBadge()

	for (const [key] of Object.entries(NotificationStore)) {
		Vue.delete(NotificationStore, key)
	}
}
