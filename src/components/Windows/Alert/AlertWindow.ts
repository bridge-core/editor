import { Window } from '../Window'
import Confirm from './Alert.vue'

export class AlertWindow extends Window {
	public component = Confirm

	constructor(public text: string) {
		super()
	}
}
