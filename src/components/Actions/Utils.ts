import { platform } from '@/utils/os'
import { IKeyBindingConfig } from './Keybinding'

export function fromStrKeyCode(keyCode: string, forceWindowsCtrl = false) {
	const parts = keyCode.toLowerCase().split(' + ')
	const keyBinding: IKeyBindingConfig = { key: '' }

	parts.forEach(p => {
		if (
			p === '⌘' ||
			((platform() !== 'darwin' || forceWindowsCtrl) && p === 'ctrl')
		) {
			keyBinding.ctrlKey = true
		} else if (p === 'alt') {
			keyBinding.altKey = true
		} else if (p === 'shift') {
			keyBinding.shiftKey = true
		} else if (p === 'meta') {
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
	let code = key.toUpperCase()
	if (shiftKey) code = 'Shift + ' + code
	if (altKey) code = 'Alt + ' + code
	if (metaKey) {
		if (platform() === 'darwin') code = 'Ctrl + ' + code
		else code = 'Meta + ' + code
	}
	if (ctrlKey) {
		if (platform() === 'darwin') code = '⌘ + ' + code
		else code = 'Ctrl + ' + code
	}

	return code
}
