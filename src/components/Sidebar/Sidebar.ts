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
			default: [],
		})
	}

	public static addButton(id: string, label: string, icon: string, callback: () => void): Button {
		const item: Button = {
			type: 'button',
			id,
			label,
			icon,
			callback,
		}

		this.items.push(item)

		return item
	}

	public static addDivider(): Divider {
		const item: Divider = {
			type: 'divider',
		}

		this.items.push(item)

		return item
	}

	public static remove(item: Button | Divider) {
		this.items.splice(this.items.indexOf(item))
	}
}
