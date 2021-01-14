import { Control, IControl } from '../Control'
import ButtonToggleComponent from './ButtonToggle.vue'

export class ButtonToggle extends Control<string> {
	config!: IControl<string> & {
		options: string[]
	}

	constructor(
		config: IControl<string> & {
			options: string[]
		}
	) {
		super(ButtonToggleComponent, config)
	}

	matches(filter: string) {
		return (
			this.config.title.toLowerCase().includes(filter) ||
			this.config.description.toLowerCase().includes(filter) ||
			this.config.options.some(option =>
				option.toLowerCase().includes(filter)
			)
		)
	}
}
