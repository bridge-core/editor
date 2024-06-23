import { Ref, ref } from 'vue'
import { v4 as uuid } from 'uuid'

export interface Notification {
	icon?: string
	color?: string
	callback?: () => void
	id: string
	type: 'button' | 'progress'
	progress?: number
	maxProgress?: number
}

export class NotificationSystem {
	public static notifications: Ref<Notification[]> = ref([])

	/* Probably don't need this but who knows?
	public static setup() {
		this.notifications.value = []
	}
    */

	public static addNotification(icon: string, callback?: () => void, color?: string): Notification {
		const notification: Notification = {
			icon,
			callback,
			color,
			id: uuid(),
			type: 'button',
		}

		NotificationSystem.notifications.value.push(notification)
		NotificationSystem.notifications.value = [...NotificationSystem.notifications.value]

		return notification
	}

	public static addProgressNotification(
		icon: string,
		progress: number,
		maxProgress: number,
		callback?: () => void,
		color?: string
	): Notification {
		const notification: Notification = {
			icon,
			callback,
			color,
			id: uuid(),
			type: 'progress',
			progress,
			maxProgress,
		}

		NotificationSystem.notifications.value.push(notification)
		NotificationSystem.notifications.value = [...NotificationSystem.notifications.value]

		return notification
	}

	public static activateNotification(notification: Notification) {
		if (notification.type === 'button') {
			NotificationSystem.notifications.value.splice(
				NotificationSystem.notifications.value.indexOf(notification),
				1
			)
			NotificationSystem.notifications.value = [...NotificationSystem.notifications.value]
		}

		if (notification.callback) notification.callback()
	}

	public static clearNotification(notification: Notification) {
		if (notification.type === 'progress') {
			// Allow time for the progress bar to reach full value
			setTimeout(() => {
				NotificationSystem.notifications.value.splice(
					NotificationSystem.notifications.value.indexOf(notification),
					1
				)
				NotificationSystem.notifications.value = [...NotificationSystem.notifications.value]
			}, 300)

			return
		}

		NotificationSystem.notifications.value.splice(NotificationSystem.notifications.value.indexOf(notification), 1)
		NotificationSystem.notifications.value = [...NotificationSystem.notifications.value]
	}

	public static setProgress(notification: Notification, progress: number) {
		notification.progress = progress
		NotificationSystem.notifications.value = [...NotificationSystem.notifications.value]
	}
}
