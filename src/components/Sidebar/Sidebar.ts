import { fileExplorer } from '@/App'

export class Sidebar {
	items: {
		type: 'button' | 'divider'
		icon?: string
		callback?: () => void
	}[] = []

	notifications: { icon?: string; color?: string; callback?: () => void }[] =
		[]

	constructor() {
		this.addButton('folder', () => {
			fileExplorer.toggle()
		})
		this.addButton('quick_reference_all', () => {})
		this.addButton('manufacturing', () => {})
		this.addButton('extension', () => {})
		this.addDivider()
		// this.addButton('download', () => {})
		// this.addButton('link', () => {})
		// this.addButton('help', () => {})

		this.addNotification('download', () => {}, 'primary')
		this.addNotification('link', () => {}, 'skinPack')
		this.addNotification('help', () => {})
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
		this.notifications.push({
			icon,
			callback,
			color,
		})
	}
}
