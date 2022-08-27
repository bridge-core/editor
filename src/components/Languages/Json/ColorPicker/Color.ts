import type { languages } from 'monaco-editor'
import { toTwoDigitHex } from './format'

export class Color {
	constructor(public colorInfo: languages.IColor) {}

	/**
	 * Formats the color as #RRGGBB
	 */
	toHex() {
		return `#${toTwoDigitHex(this.colorInfo.red * 255)}${toTwoDigitHex(
			this.colorInfo.green * 255
		)}${toTwoDigitHex(this.colorInfo.blue * 255)}`
	}

	toRgbArray() {}

	toRgbaArray() {}
}
