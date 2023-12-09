import { Ref } from 'vue'

export class Category {
	public name: string = 'Unkown Category'
	public id = 'unkown'
	public icon: string = 'help'
	public items: {
		type: 'dropdown' | 'switch'
		id: string
		defaultValue: any
		name: string
		description: string
		items?: string[] | Ref<string[]>
		apply: (value: any) => void
	}[] = []

	public addDropdown(
		id: string,
		defaultValue: any,
		name: string,
		description: string,
		items: string[] | Ref<string[]>,
		apply: (value: any) => void
	) {
		this.items.push({
			type: 'dropdown',
			defaultValue,
			id,
			name,
			description,
			items,
			apply,
		})
	}

	public addToggle(
		id: string,
		defaultValue: boolean,
		name: string,
		description: string,
		apply: (value: any) => void
	) {
		this.items.push({
			type: 'switch',
			defaultValue,
			id,
			name,
			description,
			apply,
		})
	}

	public getDefaults(): { [key: string]: any } {
		return Object.fromEntries(
			this.items.map((item) => [item.id, item.defaultValue])
		)
	}
}
