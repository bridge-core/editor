import { fileExplorer, windows } from '@/App'
import { Ref, ref } from 'vue'
import { v4 as uuid } from 'uuid'

export class Sidebar {
	items: {
		type: 'button' | 'divider'
		icon?: string
		callback?: () => void
	}[] = []

	notifications: Ref<
		{ icon?: string; color?: string; callback?: () => void; id: string }[]
	> = ref([])

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
		this.addNotification('link', () => {}, 'warning')
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

	public addNotification(icon: string, callback: () => void, color?: string) {
		this.notifications.value.push({
			icon,
			callback,
			color,
			id: uuid(),
		})

		this.notifications.value = [...this.notifications.value]
	}

	public activateNotification(item: {
		icon?: string
		color?: string
		callback?: () => void
		id: string
	}) {
		this.notifications.value.splice(
			this.notifications.value.indexOf(item),
			1
		)
		this.notifications.value = [...this.notifications.value]

		if (item.callback) item.callback()
	}
}
