import { BaseWindow } from '../../BaseWindow'
import DropdownWindowComponent from './Dropdown.vue'
import { App } from '/@/App'
import { AudioManager } from '/@/components/Audio/AudioManager'

export interface IDropdownWindowOpts {
	name: string
	isClosable?: boolean
	placeholder?: string
	options: Array<string>
	default: string
	onConfirm?: (selection: string) => Promise<void> | void
}

export class DropdownWindow extends BaseWindow<string> {
	protected currentSelection: string

	constructor(protected opts: IDropdownWindowOpts) {
		super(DropdownWindowComponent, true, false)
		this.currentSelection = opts.default
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
		App.audioManager.playAudio('click5.ogg', 1)
		if (typeof this.opts.onConfirm === 'function')
			await this.opts.onConfirm(this.currentSelection)
		super.close(this.currentSelection ?? null)
	}
}
