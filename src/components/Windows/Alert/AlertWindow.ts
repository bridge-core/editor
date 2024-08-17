import { Window } from '../Window'
import Confirm from './Alert.vue'

/**
 * @description An alert window.
 */
export class AlertWindow extends Window {
	/**
	 * @description The vue component used to display the window.
	 */
	public component = Confirm

	/**
	 * @description Creates a new alert window.
	 * @param text The text to display in the alert window.
	 */
	constructor(public text: string) {
		super()
	}
}
