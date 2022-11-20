import { reactive } from 'vue'
import { NewBaseWindow } from '../../NewBaseWindow'
import DropdownWindowComponent from './Dropdown.vue'

export interface IDropdownWindowOpts {
	name: string
	isClosable?: boolean
	placeholder?: string
	options: string[] | { text: string; value: string }[]
	default?: string
	onConfirm?: (selection: string) => Promise<void> | void
}

export class DropdownWindow extends NewBaseWindow<string> {
	protected state = reactive<any>({
		...super.state,
		currentSelection: undefined,
	})

	constructor(protected opts: IDropdownWindowOpts) {
		super(DropdownWindowComponent, true, false)
		this.state.currentSelection = opts.default ?? opts.options[0]
		this.defineWindow()
		this.open()
	}

	get title() {
		return this.opts.name
	}
	get options() {
		return this.opts.options
	}
	get placeholder() {
		return this.opts.placeholder
	}
	get isClosable() {
		return this.opts.isClosable
	}

	async confirm() {
		const selection =
			typeof this.state.currentSelection === 'object'
				? this.state.currentSelection.value
				: this.state.currentSelection

		if (typeof this.opts.onConfirm === 'function')
			await this.opts.onConfirm(selection)
		super.close(selection ?? null)
	}
}
