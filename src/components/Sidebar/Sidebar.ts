import { extensionLibrary, fileExplorer, tabManager, windows } from '@/App'
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
	items: {
		type: 'button' | 'divider'
		icon?: string
		callback?: () => void
	}[] = []

	notifications: Ref<Notification[]> = ref([])

	constructor() {
		this.addButton('folder', () => {
			fileExplorer.toggle()
		})

		this.addButton('quick_reference_all', () => {
			tabManager.openTab(tabManager.getTabByType(FindAndReplaceTab) ?? new FindAndReplaceTab())
		})

		this.addButton('manufacturing', () => {
			windows.open('compiler')
		})
		this.addButton('extension', () => {
			extensionLibrary.open()
		})
		this.addDivider()

		this.addNotification(
			'download',
			() => {
				window.open('https://bridge-core.app/guide/download/')
			},
			'primary'
		)
		// this.addNotification('link', () => {}, 'warning') // Don't remember why I put this, maybe a social media thing?
		this.addNotification('help', () => {
			window.open('https://bridge-core.app/guide/')
		})
	}

	public addButton(icon: string, callback: () => void) {
		this.items.push({
			type: 'button',
			icon,
			callback,
		})
	}

	public addDivider() {
		this.items.push({
			type: 'divider',
		})
	}

	public addNotification(icon: string, callback?: () => void, color?: string): Notification {
		const notification: Notification = {
			icon,
			callback,
			color,
			id: uuid(),
			type: 'button',
		}

		this.notifications.value.push(notification)
		this.notifications.value = [...this.notifications.value]

		return notification
	}

	public addProgressNotification(
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

		this.notifications.value.push(notification)
		this.notifications.value = [...this.notifications.value]

		return notification
	}

	public activateNotification(notification: Notification) {
		if (notification.type === 'button') {
			this.notifications.value.splice(this.notifications.value.indexOf(notification), 1)
			this.notifications.value = [...this.notifications.value]
		}

		if (notification.callback) notification.callback()
	}

	public clearNotification(notification: Notification) {
		if (notification.type === 'progress') {
			// Allow time for the progress bar to reach full value
			setTimeout(() => {
				this.notifications.value.splice(this.notifications.value.indexOf(notification), 1)
				this.notifications.value = [...this.notifications.value]
			}, 300)

			return
		}

		this.notifications.value.splice(this.notifications.value.indexOf(notification), 1)
		this.notifications.value = [...this.notifications.value]
	}

	public setProgress(notification: Notification, progress: number) {
		notification.progress = progress
		this.notifications.value = [...this.notifications.value]
	}
}
