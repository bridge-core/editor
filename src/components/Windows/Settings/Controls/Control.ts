import Vue from 'vue'
import { settingsState } from '../SettingsState'
import { App } from '/@/App'

export interface IControl<T> {
	category: string
	name: string
	description: string
	key: string
	default?: T
	onChange?: (value: T) => void | Promise<void>

	[key: string]: any
}

export abstract class Control<T> {
	readonly component!: Vue.Component
	readonly config!: IControl<T>

	abstract matches(filter: string): void

	constructor(
		component: Vue.Component,
		control: IControl<T>,
		protected state = settingsState
	) {
		Vue.set(this, 'config', control)
		Vue.set(this, 'component', component)

		if (this.value === undefined && control.default !== undefined)
			this.value = control.default
	}
	set value(value: T) {
		if (this.state[this.config.category] === undefined)
			Vue.set(this.state, this.config.category, {})
		Vue.set(this.state[this.config.category], this.config.key, value)
	}
	get value() {
		return <T>this.state[this.config.category]?.[this.config.key]
	}

	onChange = async (value: T) => {
		App.audioManager.playAudio('click5.ogg', 1)
		await (this.value = value)

		if (typeof this.config.onChange === 'function')
			await this.config.onChange(value)

		App.audioManager.playAudio('click5.ogg', 1)
	}
}
