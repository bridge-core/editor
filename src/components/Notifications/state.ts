/**
 * Reactive vue store for the Notification API
 */

import { shallowReactive } from 'vue'
import { Notification } from './Notification'

export const NotificationStore: Record<string, Notification> = shallowReactive(
	{}
)
