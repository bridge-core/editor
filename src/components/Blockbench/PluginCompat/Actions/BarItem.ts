import { Keybind } from './Keybind'
import { KeybindItem, KeybindItemOptions } from './KeybindItem'

export interface BarItemOptions extends KeybindItemOptions {
	name?: string
	description?: string
	icon: string
	condition?: any
	category?: string
	keybind?: Keybind
}

export class BarItem extends KeybindItem {
	constructor(id: string, options: BarItemOptions) {
		super(id, options)
	}

	conditionMet(): boolean {
		return false
	}
	addLabel(in_bar: any, action: any) {}
	getNode(): HTMLElement {
		return document.createElement('div')
	}
	toElement(destination: HTMLElement): this {
		return this
	}
	pushToolbar(bar: any) {}
}
