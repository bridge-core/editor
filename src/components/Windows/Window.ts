import { v4 as uuid } from 'uuid'

/**
 * @description A window.
 */
export class Window {
	/**
	 * @description The vue component used to display the window.
	 */
	public component: any
	/**
	 * @description The id of the window.
	 */
	public id: string = 'none'

	/**
	 * @description Creates a new window.
	 */
	constructor() {
		this.id = uuid()
	}
}
