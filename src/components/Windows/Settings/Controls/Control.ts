import Vue from 'vue'
import { settingsState, SettingsWindow } from '../SettingsWindow'

export interface IControl<T> {
	category: string
	title: string
	description: string
	key: string
	default?: T
	onChange?: (value: T) => void
}

export abstract class Control<T> {
	readonly component: Vue.Component
	readonly config: IControl<T>
	protected parent!: SettingsWindow

	abstract matches(filter: string): void

	constructor(component: Vue.Component, control: IControl<T>) {
		this.config = control
		this.component = component

		if (settingsState[control.category][control.key] === undefined)
			Vue.set(
				settingsState[control.category],
				control.key,
				control.default
			)
	}
	set value(value: T) {
		if (!settingsState[this.config.category])
			Vue.set(settingsState, this.config.category, {})
		Vue.set(settingsState[this.config.category], this.config.key, value)
	}
	get value() {
		return <T>(
			(settingsState[this.config.category]?.[this.config.key] ??
				this.config.default)
		)
	}

	setParent(parent: SettingsWindow) {
		this.parent = parent
	}

	onChange = async (value: T) => {
		if (typeof this.config.onChange === 'function')
			this.config.onChange(value)
		this.value = value
		await this.parent.saveSettings()
	}
}
