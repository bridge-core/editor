import { IControl } from '../Control'
import ToggleComponent from './Toggle.vue'

export class Toggle implements IControl {
	readonly component = ToggleComponent

	constructor(
		readonly title: string,
		readonly description: string,
		readonly key: string,
		readonly onChange: (value: boolean) => void = () => {}
	) {}
}
