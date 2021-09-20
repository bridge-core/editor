import { Control, IControl } from '../Control'
import ButtonToggleComponent from './ButtonToggle.vue'

export interface IButtonToggle extends IControl<string> {
	options: string[]
}

export class ButtonToggle extends Control<string, IButtonToggle> {
	constructor(config: IButtonToggle) {
		super(ButtonToggleComponent, config)
	}

	matches(filter: string) {
		return (
			this.config.name.toLowerCase().includes(filter) ||
			this.config.description.toLowerCase().includes(filter) ||
			this.config.options.some((option) =>
				option.toLowerCase().includes(filter)
			)
		)
	}
}
