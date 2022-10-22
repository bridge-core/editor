import { del, reactive, Ref, ref, set } from 'vue'
import { v4 as uuid } from 'uuid'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'

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
	public showDisabled = false

	get isDisabled() {
		return this.items.every((i) => i.isDisabled)
	}

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
	getItems(showDisabled = this.showDisabled) {
		return showDisabled
			? this.items
			: this.items.filter((item) => !item.isDisabled)
	}

	setOpen(val: boolean) {
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
		if (filter === '') return this.items.length > 0

		return (
			this.items.find((item) => item.getSearchText().includes(filter)) !==
			undefined
		)
	}
	filtered(filter: string) {
		if (filter.length === 0) return this

		const category = new SidebarCategory({
			items: this.getItems().filter((item) =>
				item.getSearchText().includes(filter)
			),
			text: this.text,
			shouldSort: this.shouldSort,
			isOpen: true,
		})
		category.showDisabled = this.showDisabled

		return category
	}
}

export interface ISidebarItemConfig {
	id: string
	text: string
	icon?: string
	color?: string
	isDisabled?: boolean
	disabledText?: string
}
export class SidebarItem {
	readonly type = 'item'
	public readonly id: string
	protected text: string
	protected icon?: string
	protected color?: string
	public isDisabled: boolean
	public disabledText?: string

	constructor({
		id,
		text,
		icon,
		color,
		isDisabled,
		disabledText,
	}: ISidebarItemConfig) {
		this.id = id
		this.text = text
		this.icon = icon
		this.color = color
		this.isDisabled = isDisabled ?? false
		this.disabledText = disabledText
	}

	getText() {
		return this.text
	}
	getSearchText() {
		return this.text.toLowerCase()
	}
}

export class Sidebar extends EventDispatcher<string | undefined> {
	public readonly _selected = ref<string | undefined>('')
	protected _filter = ref('')
	/**
	 * Stores the last _filter value that we have already selected a new element for
	 */
	protected reselectedForFilter = ''
	public readonly state: Record<string, any> = reactive({})
	protected _showDisabled = ref(false)
	protected _elements = <Ref<TSidebarElement[]>>ref([])

	constructor(
		_elements: TSidebarElement[],
		protected readonly shouldSortSidebar = true
	) {
		super()
		this.selected = this.findDefaultSelected()
	}

	get showDisabled() {
		return this._showDisabled.value
	}
	set showDisabled(val: boolean) {
		this._showDisabled.value = val

		this.rawElements.forEach((e) => {
			if (e.type === 'category') e.showDisabled = val
		})
	}

	addElement(element: TSidebarElement, additionalData?: unknown) {
		if (element.type === 'item' && additionalData)
			set(this.state, element.id, additionalData)

		if (this.has(element)) this.replace(element)
		else this._elements.value.push(element)
	}
	has(element: TSidebarElement) {
		return (
			this._elements.value.find((e) => e.id === element.id) !== undefined
		)
	}
	replace(element: TSidebarElement) {
		this._elements.value = this._elements.value.map((e) => {
			if (e.id === element.id) return element

			return e
		})
	}
	removeElements() {
		this._elements.value = []

		for (const key in this.state) {
			del(this.state, key)
		}
	}

	get filter() {
		return this._filter.value.toLowerCase()
	}
	set filter(val) {
		this._filter.value = val.toLowerCase()
	}
	setFilter(filter: string) {
		this._filter.value = filter.toLowerCase()
	}

	get elements() {
		const elements = this.sortSidebar(
			this._elements.value
				.filter((e) => {
					if (!this.showDisabled && e.isDisabled) return false

					if (e.type === 'item')
						return e.getSearchText().includes(this.filter)
					else return e.hasFilterMatches(this.filter)
				})
				.map((e) => (e.type === 'item' ? e : e.filtered(this.filter)))
		)

		if (this.filter !== this.reselectedForFilter && elements.length > 0) {
			const e = elements.find((e) => !e.isDisabled)
			if (!e) return elements

			if (e.type === 'category' && e.getItems(false).length > 0) {
				e.setOpen(true)

				const item = e.getItems(false)[0]
				if (item) this.setDefaultSelected(item.id)
			} else if (e.type === 'item') {
				this.setDefaultSelected(e.id)
			}

			this.reselectedForFilter = this.filter
		}

		return elements
	}
	get rawElements() {
		return this._elements.value
	}

	get currentElement() {
		if (!this.selected) return

		for (const element of this._elements.value) {
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
		if (!this.shouldSortSidebar) return elements

		return elements.sort((a, b) => {
			if (a.type !== b.type) return a.type.localeCompare(b.type)
			return a.getSearchText().localeCompare(b.getSearchText())
		})
	}
	protected findDefaultSelected() {
		for (const element of this.sortSidebar(this.elements)) {
			if (element.isDisabled) continue

			if (
				element.type === 'category' &&
				element.getItems(false).length > 0
			) {
				const item = element.getItems(false)[0]
				if (item) return item.id
			} else if (element.type === 'item') return element.id
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
		this._filter.value = ''
	}
	get selected() {
		return this._selected.value
	}
	set selected(val) {
		if (this._selected.value !== val) {
			this.dispatch(val)
			this._selected.value = val
		}
	}
}
