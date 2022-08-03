import { settingsState } from '../SettingsState'
import { set } from 'vue'

export interface IControl<T> {
	omitFromSaveFile?: boolean
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
	protected rawValue?: T = undefined

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
	set value(value: T | undefined) {
		if (this.config.omitFromSaveFile) {
			this.rawValue = value
			return
		}

		if (this.state[this.config.category] === undefined)
			set(this.state, this.config.category, {})
		set(this.state[this.config.category], this.config.key, value)
	}
	get value() {
		if (this.config.omitFromSaveFile) return this.rawValue
		return <T>this.state[this.config.category]?.[this.config.key]
	}

	onChange = async (value: T) => {
		if (this.value === value) return

		await (this.value = value)

		if (typeof this.config.onChange === 'function')
			await this.config.onChange(value)
	}
}
