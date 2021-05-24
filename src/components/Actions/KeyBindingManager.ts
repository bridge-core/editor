import { platform } from '/@/utils/os'
import Vue from 'vue'
import { IKeyBindingConfig, KeyBinding } from './KeyBinding'
import { toStrKeyCode } from './Utils'
import { del, set, shallowReactive } from '@vue/composition-api'

const IGNORE_KEYS = ['Control', 'Alt', 'Meta']

export class KeyBindingManager {
	protected state: Record<string, KeyBinding> = shallowReactive({})
	protected lastTimeStamp = 0

	constructor(element: HTMLDivElement | Document = document) {
		// @ts-ignore TypeScript isn't smart enough to understand that the type "KeyboardEvent" is correct
		element.addEventListener('keydown', (event: KeyboardEvent) => {
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

		set(this.state, keyCode, keyBinding)
		return keyBinding
	}
	disposeKeyBinding(keyCode: string) {
		del(this.state, keyCode)
	}
}
