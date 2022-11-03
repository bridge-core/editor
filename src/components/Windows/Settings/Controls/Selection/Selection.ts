import { Control, IControl } from '../Control'
import SelectionComponent from './Selection.vue'

export interface ISelectionControl<T> extends IControl<T> {
	options: (string | { text: string; value: string })[]
	onClick?: () => Promise<void> | void
}

export class Selection<T = string> extends Control<T, ISelectionControl<T>> {
	constructor(config: ISelectionControl<T>) {
		super(SelectionComponent, config)
	}

	matches(filter: string) {
		return (
			this.config.name.toLowerCase().includes(filter) ||
			this.config.description.toLowerCase().includes(filter) ||
			this.config.options.some((option) =>
				typeof option === 'string'
					? option.toLowerCase().includes(filter)
					: option.text.toLowerCase().includes(filter)
			)
		)
	}
}
