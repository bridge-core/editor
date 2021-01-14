import { Control, IControl } from '../Control'
import ButtonToggleComponent from './ButtonToggle.vue'

export class ButtonToggle extends Control<string> {
	constructor(
		control: IControl<string> & {
			options: string[]
		}
	) {
		super(ButtonToggleComponent, control)
	}
}
