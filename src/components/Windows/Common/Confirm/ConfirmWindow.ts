import { BaseWindow } from '/@/components/Windows/BaseWindow'
import ConfirmWindowComponent from './ConfirmWindow.vue'

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
		return this.opts.confirmText ?? 'windows.common.confirm.okay'
	}
	get cancelText() {
		return this.opts.cancelText ?? 'windows.common.confirm.cancel'
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
