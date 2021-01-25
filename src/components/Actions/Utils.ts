import { platform } from '@/utils/os'
import { IKeyBindingConfig } from './Keybinding'

export function fromStrKeyCode(keyCode: string) {
	const parts = keyCode.split(' + ')
	const keyBinding: IKeyBindingConfig = { key: '', onTrigger: () => {} }

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
