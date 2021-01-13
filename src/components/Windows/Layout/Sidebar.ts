export type TSidebarElement = SidebarCategory | SidebarItem

export interface ISidebarCategoryConfig {
	text: string
	items: SidebarItem[]
	isOpen?: boolean
}
export class SidebarCategory {
	readonly type = 'category'
	protected text: string
	protected items: SidebarItem[]
	protected isOpen: boolean

	constructor({ items, text, isOpen }: ISidebarCategoryConfig) {
		this.text = text
		this.items = items
		this.isOpen = isOpen ?? true
	}

	getItems() {
		return this.items
	}
}

export interface ISidebarItemConfig {
	id: string
	text: string
	icon?: string
	color?: string
}
export class SidebarItem {
	readonly type = 'item'
	public readonly id: string
	protected text: string
	protected icon?: string
	protected color?: string

	constructor({ id, text, icon, color }: ISidebarItemConfig) {
		this.id = id
		this.text = text
		this.icon = icon
		this.color = color
	}
}

export class Sidebar {
	protected selected?: string

	constructor(protected elements: TSidebarElement[]) {
		this.selected = this.findDefaultSelected()
	}

	addElement(element: TSidebarElement) {
		this.elements.push(element)
		if (this.elements.length === 1) this.setDefaultSelected()
	}
	removeElements() {
		this.elements = []
	}

	protected findDefaultSelected() {
		for (const element of this.elements) {
			if (element.type === 'category' && element.getItems().length > 0)
				return element.getItems()[0].id
			else if (element.type === 'item') return element.id
		}
	}
	setDefaultSelected() {
		if (!this.selected) this.selected = this.findDefaultSelected()
	}
	resetSelected() {
		this.selected = undefined
	}
}
