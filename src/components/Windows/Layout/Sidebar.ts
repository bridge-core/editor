import { reactive, set } from '@vue/composition-api'
import { App } from '/@/App'
import { v4 as uuid } from 'uuid'

export type TSidebarElement = SidebarCategory | SidebarItem
export interface ISidebarCategoryConfig {
	text: string
	items: SidebarItem[]
	isOpen?: boolean
	shouldSort?: boolean
}
export class SidebarCategory {
	public readonly type = 'category'
	public readonly id = uuid()
	protected text: string
	protected items: SidebarItem[]
	protected isOpen: boolean
	protected shouldSort: boolean

	constructor({ items, text, isOpen, shouldSort }: ISidebarCategoryConfig) {
		this.text = text
		this.items = items
		this.isOpen = isOpen ?? true
		this.shouldSort = shouldSort ?? true
		if (this.shouldSort) this.sortCategory()
	}

	addItem(item: SidebarItem) {
		this.items.push(item)
		if (this.shouldSort) this.sortCategory()
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
		App.audioManager.playAudio('click5.ogg', 1)
		this.isOpen = val
	}

	getCurrentElement(selected: string) {
		return this.items.find(({ id }) => id === selected)
	}

	sortCategory() {
		this.items = this.items.sort((a, b) =>
			a.getSearchText().localeCompare(b.getSearchText())
		)
	}
	hasFilterMatches(filter: string) {
		return (
			this.items.find((item) => item.getSearchText().includes(filter)) !==
			undefined
		)
	}
	filtered(filter: string) {
		if (filter.length === 0) return this
		return new SidebarCategory({
			items: this.items.filter((item) =>
				item.getSearchText().includes(filter)
			),
			text: this.text,
			isOpen: true,
		})
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
	protected _selected?: string
	protected _filter: string = ''
	public readonly state: Record<string, any> = {}

	constructor(protected _elements: TSidebarElement[]) {
		this.selected = this.findDefaultSelected()
	}

	addElement(element: TSidebarElement, additionalData?: unknown) {
		if (element.type === 'item' && additionalData)
			this.state[element.id] = additionalData

		if (this.has(element)) this.replace(element)
		else this._elements.push(element)
	}
	has(element: TSidebarElement) {
		return this._elements.find((e) => e.id === element.id) !== undefined
	}
	replace(element: TSidebarElement) {
		this._elements = this._elements.map((e) => {
			if (e.id === element.id) return element

			return e
		})
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
				.filter((e) => {
					if (e.type === 'item')
						return e.getSearchText().includes(this.filter)
					else return e.hasFilterMatches(this.filter)
				})
				.map((e) => (e.type === 'item' ? e : e.filtered(this.filter)))
		)

		if (elements.length > 0) {
			const e = elements[0]
			if (e.type === 'category' && e.getItems().length > 0) {
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
		if (!this.selected) return

		for (const element of this._elements) {
			if (element.type === 'item') {
				if (element.id === this.selected) return element
				else continue
			}

			const item = element.getCurrentElement(this.selected)
			if (item) return item
		}

		return
	}
	get currentState() {
		if (!this.selected) return {}
		return this.state[this.selected] ?? {}
	}
	getState(id: string) {
		return this.state[id] ?? {}
	}
	setState(id: string, data: any) {
		set(this.state, id, data)
	}

	protected sortSidebar(elements: TSidebarElement[]) {
		return elements.sort((a, b) => {
			if (a.type !== b.type) return a.type.localeCompare(b.type)
			return a.getSearchText().localeCompare(b.getSearchText())
		})
	}
	protected findDefaultSelected() {
		for (const element of this.sortSidebar(this.elements)) {
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

	clearFilter() {
		this._filter = ''
	}
	get selected() {
		return this._selected
	}
	set selected(val) {
		if (val) {
			App.audioManager.playAudio('click5.ogg', 1)
		}
		this._selected = val
	}
}
