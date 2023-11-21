import { Ref } from 'vue'

export class Category {
	public name: string = 'Unkown Category'
	public id = 'unkown'
	public icon: string = 'help'
	public items: {
		type: 'dropdown'
		id: string
		name: string
		description: string
		items: string[] | Ref<string[]>
	}[] = []

	public addDropdown(
		id: string,
		name: string,
		description: string,
		items: string[] | Ref<string[]>
	) {
		this.items.push({ type: 'dropdown', id, name, description, items })
	}
}
