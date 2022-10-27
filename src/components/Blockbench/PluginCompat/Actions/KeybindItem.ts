import { Deletable } from '../Common/Deletable'
import { Keybind } from './Keybind'

export interface KeybindItemOptions {
	keybind?: Keybind
}

export class KeybindItem extends Deletable {
	constructor(id: string, options: KeybindItemOptions) {
		super()
	}

	// TODO(BlockbenchPlugins): Implement
	delete(): void {}
}
