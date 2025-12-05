import { Window } from '../Window'
import Confirm from './Confirm.vue'

export class ConfirmWindow extends Window {
	public component = Confirm

	constructor(public text: string, public confirmCallback?: () => void, public cancelCallback?: (closedWindow: boolean) => void) {
		super()
	}

	public confirm() {
		if (this.confirmCallback) this.confirmCallback()
	}

	public cancel(closedWindow: boolean) {
		if (this.cancelCallback) this.cancelCallback(closedWindow)
	}
}
