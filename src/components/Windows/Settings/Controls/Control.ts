import Vue from 'vue'
import { settingsState } from '../SettingsState'

export interface IControl<T> {
	category: string
	title: string
	description: string
	key: string
	default?: T
	onChange?: (value: T) => void | Promise<void>
}

export abstract class Control<T> {
	readonly component: Vue.Component
	readonly config: IControl<T>

	abstract matches(filter: string): void

	constructor(component: Vue.Component, control: IControl<T>) {
		this.config = control
		this.component = component

		if (this.value === undefined && control.default !== undefined)
			this.value = control.default
	}
	set value(value: T) {
		if (settingsState[this.config.category] === undefined)
			Vue.set(settingsState, this.config.category, {})
		Vue.set(settingsState[this.config.category], this.config.key, value)
	}
	get value() {
		return <T>settingsState[this.config.category]?.[this.config.key]
	}

	onChange = async (value: T) => {
		this.value = value

		if (typeof this.config.onChange === 'function')
			await this.config.onChange(value)
	}
}
