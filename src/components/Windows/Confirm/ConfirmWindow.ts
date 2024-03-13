import { Windows } from '@/components/Windows/Windows'

export class ConfirmWindow {
	public text: string = ''

	private confirmCallback: () => void = () => {}
	private cancelCallback: () => void = () => {}

	public open(text: string, confirmCallback: () => void, cancelCallback: () => void = () => {}) {
		this.text = text
		this.confirmCallback = confirmCallback
		this.cancelCallback = cancelCallback

		Windows.open('confirm')
	}

	public confirm() {
		this.confirmCallback()
	}

	public cancel() {
		this.cancelCallback()
	}
}
