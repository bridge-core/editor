import { BaseWindow } from '/@/components/Windows/BaseWindow'
import ConfirmWindowComponent from './ConfirmWindow.vue'
import { App } from '/@/App'

export interface IConfirmWindowOpts {
	description: string
	confirmText?: string
	cancelText?: string
	onConfirm?: () => void
	onCancel?: () => void
}

export class ConfirmationWindow extends BaseWindow<boolean> {
	constructor(protected opts: IConfirmWindowOpts) {
		super(ConfirmWindowComponent, true, false)
		this.defineWindow()
		this.open()
	}

	get confirmText() {
		return this.opts.confirmText ?? 'general.okay'
	}
	get cancelText() {
		return this.opts.cancelText ?? 'general.cancel'
	}
	get description() {
		return this.opts.description
	}

	onConfirm() {
		if (typeof this.opts.onConfirm === 'function') this.opts.onConfirm()
		this.close(true)
	}
	onCancel() {
		if (typeof this.opts.onCancel === 'function') this.opts.onCancel()
		this.close(false)
	}
}
