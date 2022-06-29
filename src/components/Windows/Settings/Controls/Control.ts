import { settingsState } from '../SettingsState'
import { App } from '/@/App'
import { Component } from 'vue'

export interface IControl<T> {
	category: string
	name: string
	description: string
	key: string
	default?: T
	onChange?: (value: T) => void | Promise<void>

	[key: string]: any
}

export abstract class Control<T, K extends IControl<T> = IControl<T>> {
	readonly config: K

	abstract matches(filter: string): void

	constructor(
		protected readonly component: Component,
		control: K,
		protected state = settingsState
	) {
		this.config = control

		if (this.value === undefined && control.default !== undefined)
			this.value = control.default
	}
	set value(value: T) {
		if (this.state[this.config.category] === undefined)
			this.state[this.config.category] = {}

		this.state[this.config.category][this.config.key] = value
	}
	get value() {
		return <T>this.state[this.config.category]?.[this.config.key]
	}

	onChange = async (value: T) => {
		await (this.value = value)

		if (typeof this.config.onChange === 'function')
			await this.config.onChange(value)
	}
}
