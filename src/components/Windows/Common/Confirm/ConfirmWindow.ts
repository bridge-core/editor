import ConfirmWindowComponent from './ConfirmWindow.vue'
import { NewBaseWindow } from '../../NewBaseWindow'

export interface IConfirmWindowOpts {
	title?: string
	description: string
	confirmText?: string
	cancelText?: string
	onConfirm?: () => void
	onCancel?: () => void
	height?: number
}

export class ConfirmationWindow extends NewBaseWindow<boolean> {
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
	get title() {
		return this.opts.title ?? 'general.confirm'
	}
	get height() {
		return this.opts.height ?? 130
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
