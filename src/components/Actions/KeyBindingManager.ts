import { platform } from '@/utils/os'
import Vue from 'vue'
import { IKeyBindingConfig, KeyBinding } from './KeyBinding'
import { toStrKeyCode } from './Utils'

const IGNORE_KEYS = ['Control', 'Alt', 'Meta']

export class KeyBindingManager {
	protected state: Record<string, KeyBinding> = Vue.observable({})
	protected lastTimeStamp = 0

	constructor() {
		document.addEventListener('keydown', event => {
			const { key, ctrlKey, altKey, metaKey, shiftKey } = event
			if (IGNORE_KEYS.includes(key)) return

			const keyCode = toStrKeyCode({
				key,
				ctrlKey: platform() === 'darwin' ? metaKey : ctrlKey,
				altKey,
				metaKey: platform() === 'darwin' ? ctrlKey : metaKey,
				shiftKey,
			})

			const keyBinding = this.state[keyCode]

			if (keyBinding && this.lastTimeStamp + 100 < Date.now()) {
				if (keyBinding.prevent(event.target as HTMLElement)) return

				this.lastTimeStamp = Date.now()
				event.preventDefault()
				event.stopImmediatePropagation()
				keyBinding.trigger()
			}
		})
	}

	create(keyBindingConfig: IKeyBindingConfig) {
		const keyBinding = new KeyBinding(this, keyBindingConfig)
		const keyCode = keyBinding.toStrKeyCode()

		if (this.state[keyCode])
			throw new Error(
				`KeyBinding with keyCode "${keyCode}" already exists!`
			)

		Vue.set(this.state, keyCode, keyBinding)
		return keyBinding
	}
	disposeKeyBinding(keyCode: string) {
		Vue.delete(this.state, keyCode)
	}
}
