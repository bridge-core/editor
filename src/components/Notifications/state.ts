/**
 * Reactive vue store for the Notification API
 */

import { reactive } from 'vue'
import { Notification } from './Notification'

export const NotificationStore: Record<string, Notification> = reactive({})
