export interface KeybindKeys {
	/**
	 * Main key, can be a numeric keycode or a lower case character
	 */
	key: number | string
	ctrl?: boolean | null
	shift?: boolean | null
	alt?: boolean | null
	meta?: boolean | null
}

export class Keybind {
	constructor(keys: KeybindKeys) {}
}
