import { Control, IControl } from '../Control'
import ToggleComponent from './Toggle.vue'

export class Toggle extends Control<boolean> {
	constructor(control: IControl<boolean>) {
		super(ToggleComponent, control)
	}
}
