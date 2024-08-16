import { Settings } from '@/libs/settings/Settings'

export class Sidebar {
	public static items: {
		type: 'button' | 'divider'
		icon?: string
		callback?: () => void
	}[] = []

	public static setup() {
		this.items = []

		Settings.addSetting('sidebarRight', {
			default: false,
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
}
