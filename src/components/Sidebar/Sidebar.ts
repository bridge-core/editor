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

export class Sidebar {
	public static items: {
		type: 'button' | 'divider'
		icon?: string
		callback?: () => void
	}[] = []

	public static notifications: Ref<Notification[]> = ref([])

	public static setup() {
		this.items = []
		this.notifications.value = []
	}

	public static addButton(icon: string, callback: () => void) {
		Sidebar.items.push({
			type: 'button',
			icon,
			callback,
		})
	}

	public static addDivider() {
		Sidebar.items.push({
			type: 'divider',
		})
	}

	public static addNotification(icon: string, callback?: () => void, color?: string): Notification {
		const notification: Notification = {
			icon,
			callback,
			color,
			id: uuid(),
			type: 'button',
		}

		Sidebar.notifications.value.push(notification)
		Sidebar.notifications.value = [...Sidebar.notifications.value]

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

		Sidebar.notifications.value.push(notification)
		Sidebar.notifications.value = [...Sidebar.notifications.value]

		return notification
	}

	public static activateNotification(notification: Notification) {
		if (notification.type === 'button') {
			Sidebar.notifications.value.splice(Sidebar.notifications.value.indexOf(notification), 1)
			Sidebar.notifications.value = [...Sidebar.notifications.value]
		}

		if (notification.callback) notification.callback()
	}

	public static clearNotification(notification: Notification) {
		if (notification.type === 'progress') {
			// Allow time for the progress bar to reach full value
			setTimeout(() => {
				Sidebar.notifications.value.splice(Sidebar.notifications.value.indexOf(notification), 1)
				Sidebar.notifications.value = [...Sidebar.notifications.value]
			}, 300)

			return
		}

		Sidebar.notifications.value.splice(Sidebar.notifications.value.indexOf(notification), 1)
		Sidebar.notifications.value = [...Sidebar.notifications.value]
	}

	public static setProgress(notification: Notification, progress: number) {
		notification.progress = progress
		Sidebar.notifications.value = [...Sidebar.notifications.value]
	}
}
