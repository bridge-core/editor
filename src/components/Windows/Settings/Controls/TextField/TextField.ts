import { Control, IControl } from '../Control'
import TextFieldComponent from './TextField.vue'

export class TextField<T = string> extends Control<T, IControl<T>> {
	constructor(config: IControl<T>) {
		super(TextFieldComponent, config)
	}

	matches(filter: string) {
		return (
			this.config.name.toLowerCase().includes(filter) ||
			this.config.description.toLowerCase().includes(filter)
		)
	}
}
