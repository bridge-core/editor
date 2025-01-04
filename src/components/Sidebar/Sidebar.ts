import { Settings } from '@/libs/settings/Settings'

export type Button = {
	type: 'button'
	id: string
	label: string
	icon: string
	callback?: () => void
}

export type Divider = {
	type: 'divider'
}

export type SidebarItem = Button | Divider

export class Sidebar {
	public static items: SidebarItem[] = []

	public static setup() {
		this.items = []

		Settings.addSetting('sidebarRight', {
			default: false,
		})

		Settings.addSetting('sidebarSize', {
			default: 'normal',
		})

		Settings.addSetting('hiddenSidebarElements', {
			default: ['compiler'],
		})
	}

	public static addButton(id: string, label: string, icon: string, callback: () => void) {
		Sidebar.items.push({
			type: 'button',
			id,
			label,
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
