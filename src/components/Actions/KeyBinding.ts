import { KeyBindingManager } from './KeyBindingManager'
import { fromStrKeyCode, toStrKeyCode } from './Utils'

export interface IKeyBindingConfig {
	key: string
	shiftKey?: boolean
	ctrlKey?: boolean
	altKey?: boolean
	metaKey?: boolean
	prevent?: (element: HTMLElement) => boolean
	onTrigger?: () => Promise<void> | void
}

export class KeyBinding {
	constructor(
		protected keyBindingManager: KeyBindingManager,
		protected config: IKeyBindingConfig
	) {}

	static fromStrKeyCode(
		keyBindingManager: KeyBindingManager,
		keyCode: string,
		onTrigger: () => Promise<void> | void
	) {
		return new KeyBinding(keyBindingManager, {
			...fromStrKeyCode(keyCode),
			onTrigger,
		})
	}
	toStrKeyCode() {
		return toStrKeyCode(this.config)
	}

	async trigger() {
		if (typeof this.config.onTrigger === 'function')
			await this.config.onTrigger()
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
