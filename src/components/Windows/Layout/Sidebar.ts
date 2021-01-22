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

	addItem(item: SidebarItem) {
		this.items.push(item)
	}
	removeItems() {
		this.items = []
	}

	getText() {
		return this.text
	}
	getSearchText() {
		return this.text.toLowerCase()
	}
	getItems() {
		return this.items
	}

	setOpen(val: boolean) {
		this.isOpen = val
	}

	getCurrentElement(selected: string) {
		return this.items.find(({ id }) => id === selected)
	}

	hasFilterMatches(filter: string) {
		return (
			this.items.find(item => item.getSearchText().includes(filter)) !==
			undefined
		)
	}
	filtered(filter: string) {
		if (filter.length === 0) return this
		return Vue.observable(
			new SidebarCategory({
				items: this.items.filter(item =>
					item.getSearchText().includes(filter)
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
		return this.text
	}
	getSearchText() {
		return this.text.toLowerCase()
	}
}

export class Sidebar {
	protected selected?: string
	protected _filter: string = ''
	public readonly state: Record<string, unknown> = {}

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

	get filter() {
		return this._filter.toLowerCase()
	}
	get elements() {
		const elements = this.sortSidebar(
			this._elements
				.filter(e => {
					if (e.type === 'item')
						return e.getSearchText().includes(this.filter)
					else return e.hasFilterMatches(this.filter)
				})
				.map(e => (e.type === 'item' ? e : e.filtered(this.filter)))
		)

		if (elements.length === 1) {
			const e = elements[0]
			if (e.type === 'category' && e.getItems().length === 1) {
				e.setOpen(true)
				this.setDefaultSelected(e.getItems()[0].id)
			}
		}

		return elements
	}
	get rawElements() {
		return this._elements
	}

	get currentElement() {
		if (!this.selected) return {}

		for (const element of this._elements) {
			if (element.type === 'item') {
				if (element.id === this.selected) return element
				else continue
			}

			const item = element.getCurrentElement(this.selected)
			if (item) return item
		}

		return {}
	}
	get currentState() {
		if (!this.selected) return {}
		return this.state[this.selected] ?? {}
	}
	getState(id: string) {
		return this.state[id] ?? {}
	}
	setState(id: string, data: any) {
		Vue.set(this.state, id, data)
	}

	protected sortSidebar(elements: TSidebarElement[]) {
		return elements.sort((a, b) => {
			if (a.type !== b.type) return a.type.localeCompare(b.type)
			return a.getSearchText().localeCompare(b.getSearchText())
		})
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
