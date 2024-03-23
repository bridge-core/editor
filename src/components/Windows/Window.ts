import { v4 as uuid } from 'uuid'

export class Window {
	public component: any
	public id: string = 'none'

	constructor() {
		this.id = uuid()
	}
}
