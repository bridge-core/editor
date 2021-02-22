import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { KeyBindingManager } from './KeyBindingManager'
import { fromStrKeyCode, toStrKeyCode } from './Utils'

export interface IKeyBindingConfig {
	key: string
	shiftKey?: boolean
	ctrlKey?: boolean
	altKey?: boolean
	metaKey?: boolean
	prevent?: (element: HTMLElement) => boolean
}

export class KeyBinding extends EventDispatcher<void> {
	constructor(
		protected keyBindingManager: KeyBindingManager,
		protected config: IKeyBindingConfig
	) {
		super()
	}

	static fromStrKeyCode(
		keyBindingManager: KeyBindingManager,
		keyCode: string,
		forceWindowsCtrl = false,
		prevent: IKeyBindingConfig['prevent']
	) {
		return keyBindingManager.create({
			...fromStrKeyCode(keyCode, forceWindowsCtrl),
			prevent,
		})
	}
	toStrKeyCode() {
		return toStrKeyCode(this.config)
	}

	async trigger() {
		this.dispatch()
	}
	prevent(element: HTMLElement) {
		if (typeof this.config.prevent === 'function')
			return this.config.prevent(element)
		return false
	}

	dispose() {
		this.keyBindingManager.disposeKeyBinding(this.toStrKeyCode())
	}
}
