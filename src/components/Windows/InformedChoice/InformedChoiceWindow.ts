import { Window } from '../Window'
import Confirm from './InformedChoice.vue'

export type InformedChoice = {
	icon: string
	name: string
	description: string
	choose: () => void
}

export class InformedChoiceWindow extends Window {
	public component = Confirm

	constructor(public name: string, public choices: InformedChoice[], public cancelCallback?: () => void) {
		super()
	}

	public choose(choice: InformedChoice) {
		choice.choose()
	}

	public cancel() {
		if (this.cancelCallback) this.cancelCallback()
	}
}
