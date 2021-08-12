/**
 * Reactive vue store for the Notification API
 */

import { shallowReactive } from '@vue/composition-api'
import { Notification } from './Notification'

export const NotificationStore: Record<string, Notification> = shallowReactive(
	{}
)
