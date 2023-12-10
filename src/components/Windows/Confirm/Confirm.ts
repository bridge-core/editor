import { windows } from '@/App'

export class ConfirmWindow {
	public text: string = ''

	private confirmCallback: () => void = () => {}
	private cancelCallback: () => void = () => {}

	public open(
		text: string,
		confirmCallback: () => void,
		cancelCallback: () => void = () => {}
	) {
		this.text = text
		this.confirmCallback = confirmCallback
		this.cancelCallback = cancelCallback

		windows.open('confirm')
	}

	public confirm() {
		this.confirmCallback()
	}

	public cancel() {
		this.cancelCallback()
	}
}
