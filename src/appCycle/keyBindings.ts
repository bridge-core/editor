import type { Disposable } from '@/types/disposable'
import { platform } from '@/utils/os'

const IGNORE_KEYS = ['Control', 'Alt', 'Meta']
const KEYMAP = new Map<string, KeyBindingData>()

export interface KeyBindingData {
	prevent?: (element: HTMLElement) => boolean
	action: () => void
}
export interface KeyBinding {
	key: string
	shiftKey?: boolean
	ctrlKey?: boolean
	altKey?: boolean
	metaKey?: boolean
	prevent?: (element: HTMLElement) => boolean
}

export function fromStrKeyCode(keyCode: string) {
	const parts = keyCode.split(' + ')
	const keyBinding: KeyBinding = { key: '' }

	parts.forEach(p => {
		switch (p.toLowerCase()) {
			case 'ctrl':
			case 'cmd':
				keyBinding.ctrlKey = true
				break
			case 'alt':
				keyBinding.altKey = true
				break
			case 'shift':
				keyBinding.shiftKey = true
				break
			case 'meta':
				keyBinding.metaKey = true
				break
			default:
				keyBinding.key = p.toLowerCase()
		}
	})

	return keyBinding
}

export function getStrKeyCode({
	key,
	ctrlKey,
	altKey,
	shiftKey,
	metaKey,
}: KeyBinding) {
	let code = key.toUpperCase()
	if (shiftKey) code = 'Shift + ' + code
	if (altKey) code = 'Alt + ' + code
	if (metaKey) {
		if (platform() === 'darwin') code = 'Ctrl + ' + code
		else code = 'Meta + ' + code
	}
	if (ctrlKey) {
		if (platform() === 'darwin') code = 'Cmd + ' + code
		else code = 'Ctrl + ' + code
	}

	return code
}

export function addKeyBinding(
	keyBinding: KeyBinding,
	action: () => void
): Disposable {
	const keyCode = getStrKeyCode(keyBinding)

	if (KEYMAP.has(keyCode)) {
		throw new Error(`KeyBinding with keyCode "${keyCode}" already exists!`)
	}

	const { prevent } = keyBinding
	KEYMAP.set(keyCode, { action, prevent })

	return {
		dispose: () => KEYMAP.delete(keyCode),
	}
}

let lastTimeStamp = 0
export function setupKeyBindings() {
	document.addEventListener('keydown', event => {
		const { key, ctrlKey, altKey, metaKey, shiftKey } = event
		if (IGNORE_KEYS.includes(key)) return

		const { action, prevent } =
			KEYMAP.get(
				getStrKeyCode({
					key,
					ctrlKey: platform() === 'darwin' ? metaKey : ctrlKey,
					altKey,
					metaKey: platform() === 'darwin' ? ctrlKey : metaKey,
					shiftKey,
				})
			) ?? {}

		if (action && lastTimeStamp + 100 < Date.now()) {
			if (prevent?.(event.target as HTMLElement)) return
			lastTimeStamp = Date.now()
			event.preventDefault()
			event.stopImmediatePropagation()
			action()
		}
	})
}
