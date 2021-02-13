import { Control, IControl } from '../Control'
import SelectionComponent from './Selection.vue'

export class Selection<T = string> extends Control<T> {
	config!: IControl<T> & {
		options: (string | { text: string; value: string })[]
	}

	constructor(
		config: IControl<T> & {
			options: (string | { text: string; value: string })[]
		}
	) {
		super(SelectionComponent, config)
	}

	matches(filter: string) {
		return (
			this.config.name.toLowerCase().includes(filter) ||
			this.config.description.toLowerCase().includes(filter) ||
			this.config.options.some(option =>
				typeof option === 'string'
					? option.toLowerCase().includes(filter)
					: option.text.toLowerCase().includes(filter)
			)
		)
	}
}
