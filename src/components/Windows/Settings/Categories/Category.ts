import { Component, Ref, markRaw } from 'vue'

export class Category {
	public name: string = 'Unkown Category'
	public id = 'unkown'
	public icon: string = 'help'
	public items: {
		type: 'dropdown' | 'switch' | 'custom'
		id: string
		defaultValue: any
		name: string
		description: string
		apply: (value: any) => void
		items?: string[] | Ref<string[]>
		component?: Component
		load?: () => any
		save?: (vale: any) => void
	}[] = []

	public addDropdown(
		id: string,
		defaultValue: any,
		name: string,
		description: string,
		items: string[] | Ref<string[]>,
		apply: (value: string) => void
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
		apply: (value: boolean) => void
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

	public addCustom(
		component: Component,
		id: string,
		defaultValue: any,
		name: string,
		description: string,
		apply: (value: any) => void,
		load?: () => any,
		save?: (vale: any) => void
	) {
		this.items.push({
			type: 'custom',
			defaultValue,
			id,
			name,
			description,
			apply,
			component: markRaw(component),
			load,
			save,
		})
	}

	public getDefaults(): { [key: string]: any } {
		return Object.fromEntries(
			this.items.map((item) => [item.id, item.defaultValue])
		)
	}
}
