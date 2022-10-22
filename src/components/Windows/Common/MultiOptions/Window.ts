import MultiWindowComponent from './Window.vue'
import { NewBaseWindow } from '../../NewBaseWindow'

export interface IOption {
	name: string
	isSelected: boolean
}
export interface IMultiOptionsWindowConfig {
	name: string
	options: IOption[]
	isClosable?: boolean
}

export class MultiOptionsWindow extends NewBaseWindow<string[]> {
	constructor(protected config: IMultiOptionsWindowConfig) {
		super(MultiWindowComponent, true, false)

		this.defineWindow()
		this.open()
	}

	get name() {
		return this.config.name
	}
	get options() {
		return this.config.options
	}
	get isClosable() {
		return this.config.isClosable
	}
}
