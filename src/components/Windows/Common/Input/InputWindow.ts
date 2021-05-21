import { BaseWindow } from '../../BaseWindow'
import InputWindowComponent from './Input.vue'
import { App } from '/@/App'

export interface IInputWindowOpts {
	name: string
	label: string
	default?: string
	expandText?: string
	onConfirm?: (input: string) => Promise<void> | void
}

export class InputWindow extends BaseWindow<string> {
	protected inputValue: string

	constructor(protected opts: IInputWindowOpts) {
		super(InputWindowComponent, true, false)
		this.inputValue = opts.default ?? ''
		super.defineWindow()
		super.open()
	}

	get title() {
		return this.opts.name
	}
	get label() {
		return this.opts.label
	}
	get expandText() {
		return this.opts.expandText
	}

	async confirm() {
		const finalInput = this.inputValue + (this.expandText ?? '')
		if (typeof this.opts.onConfirm === 'function')
			await this.opts.onConfirm(finalInput)
		super.close(finalInput)
	}
}
