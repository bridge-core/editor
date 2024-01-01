import { fileExplorer, windows } from '@/App'
import { Ref, ref } from 'vue'
import { v4 as uuid } from 'uuid'

export interface Notification {
	icon?: string
	color?: string
	callback?: () => void
	id: string
	type: 'button' | 'progress'
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
		this.addButton('quick_reference_all', () => {})
		this.addButton('manufacturing', () => {
			windows.open('compiler')
		})
		this.addButton('extension', () => {})
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

	public addNotification(
		icon: string,
		callback?: () => void,
		color?: string,
		type: 'button' | 'progress' = 'button'
	): Notification {
		const notification = {
			icon,
			callback,
			color,
			id: uuid(),
			type,
		}

		this.notifications.value.push(notification)
		this.notifications.value = [...this.notifications.value]

		return notification
	}

	public activateNotification(item: Notification) {
		if (item.type === 'button') {
			this.notifications.value.splice(
				this.notifications.value.indexOf(item),
				1
			)
			this.notifications.value = [...this.notifications.value]
		}

		if (item.callback) item.callback()
	}

	public clearNotification(item: Notification) {
		this.notifications.value.splice(
			this.notifications.value.indexOf(item),
			1
		)
		this.notifications.value = [...this.notifications.value]
	}
}
