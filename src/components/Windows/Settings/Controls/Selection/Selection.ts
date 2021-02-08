import { Control, IControl } from '../Control'
import SelectionComponent from './Selection.vue'

export class Selection extends Control<string> {
	config!: IControl<string> & {
		options: (string | { text: string; value: string })[]
	}

	constructor(
		config: IControl<string> & {
			options: (string | { text: string; value: string })[]
		}
	) {
		super(SelectionComponent, config)
	}

	matches(filter: string) {
		return (
			this.config.title.toLowerCase().includes(filter) ||
			this.config.description.toLowerCase().includes(filter) ||
			this.config.options.some(option =>
				typeof option === 'string'
					? option.toLowerCase().includes(filter)
					: option.text.toLowerCase().includes(filter)
			)
		)
	}
}
