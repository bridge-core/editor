import { platform } from '/@/utils/os'
import { IKeyBindingConfig, KeyBinding } from './KeyBinding'
import { toStrKeyCode } from './Utils'
import { del, set, shallowReactive } from 'vue'

const IGNORE_KEYS = ['Control', 'Alt', 'Meta']

interface IKeyEvent {
	key: string
	altKey: boolean
	ctrlKey: boolean
	shiftKey: boolean
	metaKey: boolean
	target: EventTarget | null
	preventDefault: () => void
	stopImmediatePropagation: () => void
}
export class KeyBindingManager {
	protected state: Record<string, KeyBinding> = shallowReactive({})
	protected lastTimeStamp = 0

	protected onKeydown = (event: IKeyEvent) => {
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
	}
	protected onMouseDown = (event: MouseEvent) => {
		let buttonName = null
		switch (event.button) {
			case 0:
				buttonName = 'Left'
				break
			case 1:
				buttonName = 'Middle'
				break
			case 2:
				buttonName = 'Right'
				break
			case 3:
				buttonName = 'Back'
				break
			case 4:
				buttonName = 'Forward'
				break
			default:
				console.error(`Unknown mouse button: ${event.button}`)
		}
		if (!buttonName) return

		this.onKeydown({
			key: `mouse${buttonName}`,
			ctrlKey: event.ctrlKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
			shiftKey: event.shiftKey,
			target: event.target,
			preventDefault: () => event.preventDefault(),
			stopImmediatePropagation: () => event.stopImmediatePropagation(),
		})
	}

	constructor(protected element: HTMLDivElement | Document = document) {
		// @ts-ignore TypeScript isn't smart enough to understand that the type "KeyboardEvent" is correct
		element.addEventListener('keydown', this.onKeydown)

		// @ts-ignore TypeScript isn't smart enough to understand that the type "MouseEvent" is correct
		element.addEventListener('mousedown', this.onMouseDown)
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

	dispose() {
		// @ts-ignore TypeScript isn't smart enough to understand that the type "KeyboardEvent" is correct
		this.element.removeEventListener('keydown', this.onKeydown)
	}
}
