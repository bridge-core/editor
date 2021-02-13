import { Control, IControl } from '../Control'
import ToggleComponent from './Toggle.vue'

export class Toggle<T = boolean> extends Control<T> {
	constructor(config: IControl<T>) {
		super(ToggleComponent, config)
	}

	matches(filter: string) {
		return (
			this.config.name.toLowerCase().includes(filter) ||
			this.config.description.toLowerCase().includes(filter)
		)
	}
}
