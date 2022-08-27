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

	/**
	 * Formats the color as #RRGGBBAA
	 */
	toHexA() {
		return `#${toTwoDigitHex(this.colorInfo.red * 255)}${toTwoDigitHex(
			this.colorInfo.green * 255
		)}${toTwoDigitHex(this.colorInfo.blue * 255)}${toTwoDigitHex(
			this.colorInfo.alpha * 255
		)}`
	}

	/**
	 * Formats the color as [r, g, b]
	 */
	toRgbArray() {
		return [
			+this.colorInfo.red.toFixed(5),
			+this.colorInfo.green.toFixed(5),
			+this.colorInfo.blue.toFixed(5),
		]
	}

	/**
	 * Formats the color as [r, g, b, a]
	 */
	toRgbaArray() {
		return [
			+this.colorInfo.red.toFixed(5),
			+this.colorInfo.green.toFixed(5),
			+this.colorInfo.blue.toFixed(5),
			this.colorInfo.alpha,
		]
	}
}
