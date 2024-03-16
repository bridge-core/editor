import { extensionLibrary, fileExplorer } from '@/App'
import { TabManager } from '@/components/TabSystem/TabManager'
import { Windows } from '@/components/Windows/Windows'
import { Ref, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import { FindAndReplaceTab } from '../Tabs/FindAnReplace/FindAndReplaceTab'

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
		Sidebar.addButton('folder', () => {
			fileExplorer.toggle()
		})

		Sidebar.addButton('quick_reference_all', () => {
			TabManager.openTab(TabManager.getTabByType(FindAndReplaceTab) ?? new FindAndReplaceTab())
		})

		Sidebar.addButton('manufacturing', () => {
			Windows.open('compiler')
		})
		Sidebar.addButton('extension', () => {
			extensionLibrary.open()
		})
		Sidebar.addDivider()

		Sidebar.addNotification(
			'download',
			() => {
				window.open('https://bridge-core.app/guide/download/')
			},
			'primary'
		)
		// Sidebar.addNotification('link', () => {}, 'warning') // Don't remember why I put this, maybe a social media thing?
		Sidebar.addNotification('help', () => {
			window.open('https://bridge-core.app/guide/')
		})
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
