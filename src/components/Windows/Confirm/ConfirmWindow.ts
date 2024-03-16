import { Windows } from '@/components/Windows/Windows'

export class ConfirmWindow {
	public static text: string = ''

	private static confirmCallback: () => void = () => {}
	private static cancelCallback: () => void = () => {}

	public static open(text: string, confirmCallback: () => void, cancelCallback: () => void = () => {}) {
		ConfirmWindow.text = text
		ConfirmWindow.confirmCallback = confirmCallback
		ConfirmWindow.cancelCallback = cancelCallback

		Windows.open('confirm')
	}

	public static confirm() {
		ConfirmWindow.confirmCallback()
	}

	public static cancel() {
		ConfirmWindow.cancelCallback()
	}
}
