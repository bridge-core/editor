import { Window } from '../Window'
import Confirm from './Confirm.vue'

export class ConfirmWindow extends Window {
	public component = Confirm

	constructor(public text: string, public confirmCallback?: () => void, public cancelCallback?: () => void) {
		super()
	}

	public confirm() {
		if (this.confirmCallback) this.confirmCallback()
	}

	public cancel() {
		if (this.cancelCallback) this.cancelCallback()
	}
}
