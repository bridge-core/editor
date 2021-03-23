/**
 * Reactive vue store for the Notification API
 */

import Vue from 'vue'
import { Notification } from './Notification'

export const NotificationStore: Record<string, Notification> = Vue.observable(
	{}
)
