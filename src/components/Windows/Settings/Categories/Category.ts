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
	name: string
	description: string
	component: Component
}

type ButtonItem = {
	type: 'button'
	id: string
	text: string
	name: string
	description: string
	trigger: () => void
}

type Setting = {
	id: string
	defaultValue: any
	name: string
	description: string
	load?: () => Promise<any>
	save?: (value: any) => Promise<void>
	update?: (value: any, initial: boolean) => Promise<void>
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
		update?: (value: any, initial: boolean) => Promise<void>
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
			name,
			description,
			update,
		})
	}

	public addToggle(id: string, defaultValue: boolean, name: string, description: string) {
		this.items.push({
			type: 'switch',
			id,
			name,
			description,
		})

		this.settings.push({
			id,
			defaultValue,
			name,
			description,
		})
	}

	public addButton(id: string, text: string, description: string, trigger: () => void) {
		this.items.push({
			type: 'button',
			id,
			text,
			name: text,
			description,
			trigger,
		})
	}

	public addCustom(component: Component, id: string) {
		this.items.push({
			type: 'custom',
			id,
			name: id,
			description: id,
			component: markRaw(component),
		})
	}

	public addSetting(
		id: string,
		defaultValue: any,
		name: string,
		description: string,
		update?: (value: any, initial: boolean) => Promise<any>,
		save?: (value: any) => Promise<void>,
		load?: () => Promise<any>
	) {
		this.settings.push({
			id,
			defaultValue,
			name,
			description,
			update,
			save,
			load,
		})
	}

	public getDefaults(): { [key: string]: any } {
		return Object.fromEntries(this.settings.map((setting) => [setting.id, setting.defaultValue]))
	}
}
