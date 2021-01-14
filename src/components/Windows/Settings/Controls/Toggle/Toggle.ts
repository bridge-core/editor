import { Control, IControl } from '../Control'
import ToggleComponent from './Toggle.vue'

export class Toggle extends Control<boolean> {
	constructor(config: IControl<boolean>) {
		super(ToggleComponent, config)
	}

	matches(filter: string) {
		return (
			this.config.title.toLowerCase().includes(filter) ||
			this.config.description.toLowerCase().includes(filter)
		)
	}
}
