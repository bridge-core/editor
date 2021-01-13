import Vue from 'vue'

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

	getText() {
		return this.text
	}
	getItems() {
		return this.items
	}

	hasFilterMatches(filter: string) {
		return (
			this.items.find(item => item.getText().includes(filter)) !==
			undefined
		)
	}
	getFiltered(filter: string) {
		if (filter.length === 0) return this
		return Vue.observable(
			new SidebarCategory({
				items: this.items.filter(item =>
					item.getText().includes(filter)
				),
				text: this.text,
				isOpen: this.isOpen,
			})
		)
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

	getText() {
		return this.text.toLowerCase()
	}
}

export class Sidebar {
	protected selected?: string
	protected filter: string = ''
	protected state: Record<string, unknown> = {}

	constructor(protected _elements: TSidebarElement[]) {
		this.selected = this.findDefaultSelected()
	}

	addElement(element: TSidebarElement, additionalData?: unknown) {
		if (element.type === 'item' && additionalData)
			this.state[element.id] = additionalData

		this._elements.push(element)
		if (this._elements.length === 1) this.setDefaultSelected()
	}
	removeElements() {
		this._elements = []
	}
	get elements() {
		return this._elements
			.filter(e => {
				if (e.type === 'item') return e.getText().includes(this.filter)
				else return e.hasFilterMatches(this.filter)
			})
			.map(e => (e.type === 'item' ? e : e.getFiltered(this.filter)))
			.sort((a, b) => {
				if (a.type !== b.type) return a.type.localeCompare(b.type)
				return a
					.getText()
					.toLowerCase()
					.localeCompare(b.getText().toLowerCase())
			})
	}

	get currentState() {
		if (!this.selected) return {}
		return this.state[this.selected] ?? {}
	}

	protected findDefaultSelected() {
		for (const element of this.elements) {
			if (element.type === 'category' && element.getItems().length > 0)
				return element.getItems()[0].id
			else if (element.type === 'item') return element.id
		}
	}
	setDefaultSelected(value?: string) {
		if (value) this.selected = value
		else if (!this.selected) this.selected = this.findDefaultSelected()
	}
	resetSelected() {
		this.selected = undefined
	}
}
