import { BaseWindow } from '../../BaseWindow'
import InputWindowComponent from './Input.vue'

export interface IInputWindowOpts {
	name: string
	label: string
	default?: string
	expandText?: string
	onConfirm: (input: string) => Promise<void> | void
}

export class InputWindow extends BaseWindow<void> {
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
		if (typeof this.opts.onConfirm === 'function')
			await this.opts.onConfirm(this.inputValue + (this.expandText ?? ''))
		super.close()
	}
}
