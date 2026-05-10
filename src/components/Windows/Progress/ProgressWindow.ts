import { Window } from '../Window'
import WindowComponent from './Progress.vue'

export class ProgressWindow extends Window {
	public component = WindowComponent

	constructor(public text: string) {
		super()
	}
}
