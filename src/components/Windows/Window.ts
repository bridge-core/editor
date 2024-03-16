import { v4 as uuid } from 'uuid'

export class Window {
	public id: string = 'none'
	public component: any
	public uuid: string = ''

	constructor() {
		this.uuid = uuid()
	}
}
