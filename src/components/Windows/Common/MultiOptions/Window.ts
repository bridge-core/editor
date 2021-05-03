import { BaseWindow } from '/@/components/Windows/BaseWindow'
import MultiWindowComponent from './Window.vue'

export interface IOption {
	name: string
	isSelected: boolean
}
export interface IMultiOptionsWindowConfig {
	name: string
	options: IOption[]
	isClosable?: boolean
}

export class MultiOptionsWindow extends BaseWindow<string[]> {
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
