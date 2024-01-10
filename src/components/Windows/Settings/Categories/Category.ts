import { Component, Ref, markRaw } from 'vue'

type DropdownItem = {
	type: 'dropdown'
	id: string
	name: string
	description: string
	items: string[] | Ref<string[]>
}

type SwitchItem = {
	type: 'switch'
	id: string
	name: string
	description: string
}

type CustomItem = {
	type: 'custom'
	id: string
	component: Component
}

type ButtonItem = {
	type: 'button'
	id: string
	text: string
	description: string
	trigger: () => void
}

type Setting = {
	id: string
	defaultValue: any
	apply: (value: any) => void
	load?: () => any
	save?: (vale: any) => void
}

export class Category {
	public name: string = 'Unkown Category'
	public id = 'unkown'
	public icon: string = 'help'
	public items: (DropdownItem | SwitchItem | CustomItem | ButtonItem)[] = []
	public settings: Setting[] = []

	public addDropdown(
		id: string,
		defaultValue: string,
		name: string,
		description: string,
		items: string[] | Ref<string[]>,
		apply: (value: string) => void
	) {
		this.items.push({
			type: 'dropdown',
			id,
			name,
			description,
			items,
		})

		this.settings.push({
			id,
			defaultValue,
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
			id,
			name,
			description,
		})

		this.settings.push({
			id,
			defaultValue,
			apply,
		})
	}

	public addButton(id: string, text: string, description: string, trigger: () => void) {
		this.items.push({
			type: 'button',
			id,
			text,
			description,
			trigger,
		})
	}

	public addCustom(component: Component, id: string) {
		this.items.push({
			type: 'custom',
			id,
			component: markRaw(component),
		})
	}

	public addSetting(
		id: string,
		defaultValue: any,
		apply: (value: any) => void,
		save: (value: any) => Promise<void>,
		load: () => Promise<any>
	) {
		this.settings.push({
			id,
			defaultValue,
			apply,
			save,
			load,
		})
	}

	public getDefaults(): { [key: string]: any } {
		return Object.fromEntries(this.settings.map((setting) => [setting.id, setting.defaultValue]))
	}
}
