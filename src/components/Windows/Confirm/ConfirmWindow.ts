import { Windows } from '@/components/Windows/Windows'
import { Window } from '../Window'
import Confirm from './Confirm.vue'

export class ConfirmWindow extends Window {
	public static text: string = ''

	private static confirmCallback: () => void = () => {}
	private static cancelCallback: () => void = () => {}

	public id = 'confirm'
	public component = Confirm

	public static open(text: string, confirmCallback: () => void, cancelCallback: () => void = () => {}) {
		ConfirmWindow.text = text
		ConfirmWindow.confirmCallback = confirmCallback
		ConfirmWindow.cancelCallback = cancelCallback

		Windows.open(new ConfirmWindow())
	}

	public static confirm() {
		ConfirmWindow.confirmCallback()
	}

	public static cancel() {
		ConfirmWindow.cancelCallback()
	}
}
