import { settingsState } from '../SettingsState'
import { App } from '/@/App'
import { set } from '@vue/composition-api'

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
	readonly component!: Vue.Component
	readonly config!: K

	abstract matches(filter: string): void

	constructor(
		component: Vue.Component,
		control: K,
		protected state = settingsState
	) {
		set(this, 'config', control)
		set(this, 'component', component)

		if (this.value === undefined && control.default !== undefined)
			this.value = control.default
	}
	set value(value: T) {
		if (this.state[this.config.category] === undefined)
			set(this.state, this.config.category, {})
		set(this.state[this.config.category], this.config.key, value)
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
