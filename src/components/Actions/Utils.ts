import { platform } from '/@/utils/os'
import { IKeyBindingConfig } from './KeyBinding'

export function fromStrKeyCode(keyCode: string, forceWindowsCtrl = false) {
	const parts = keyCode.toLowerCase().split(' + ')
	const keyBinding: IKeyBindingConfig = { key: '' }

	parts.forEach((p) => {
		if (
			p === '⌘' ||
			((platform() !== 'darwin' || forceWindowsCtrl) && p === 'ctrl')
		) {
			keyBinding.ctrlKey = true
		} else if (p === '⌥' || p === 'alt') {
			keyBinding.altKey = true
		} else if (p === '⇧' || p === 'shift') {
			keyBinding.shiftKey = true
		} else if (p === '⌃' || p === 'meta') {
			keyBinding.metaKey = true
		} else {
			keyBinding.key = p
		}
	})

	return keyBinding
}

export function toStrKeyCode({
	key,
	ctrlKey,
	altKey,
	shiftKey,
	metaKey,
}: IKeyBindingConfig) {
	const p = platform()

	let code = key.toUpperCase()
	if (shiftKey) {
		if (p === 'darwin') code = '⇧ + ' + code
		else code = 'Shift + ' + code
	}
	if (altKey) {
		if (p === 'darwin') code = '⌥ + ' + code
		else code = 'Alt + ' + code
	}
	if (metaKey) {
		if (p === 'darwin') code = '⌃ + ' + code
		else code = 'Meta + ' + code
	}
	if (ctrlKey) {
		if (p === 'darwin') code = '⌘ + ' + code
		else code = 'Ctrl + ' + code
	}

	return code
}
