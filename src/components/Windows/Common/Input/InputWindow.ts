import { reactive } from 'vue'
import { NewBaseWindow } from '../../NewBaseWindow'
import InputWindowComponent from './Input.vue'
import { App } from '/@/App'

export interface IInputWindowOpts {
	name: string
	label: string
	default?: string
	expandText?: string
	onConfirm?: (input: string) => Promise<void> | void
}

export class InputWindow extends NewBaseWindow<string | null> {
	protected state = reactive<any>({
		...super.getState(),
		inputValue: '',
	})

	constructor(protected opts: IInputWindowOpts) {
		super(InputWindowComponent, true, false)
		this.state.inputValue = opts.default ?? ''
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
		const finalInput = this.state.inputValue + (this.expandText ?? '')

		if (typeof this.opts.onConfirm === 'function')
			await this.opts.onConfirm(finalInput)

		super.close(finalInput)
	}
}
