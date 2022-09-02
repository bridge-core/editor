import type { languages } from 'monaco-editor'
import { toTwoDigitHex } from './parse/hex'

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
			Math.round(this.colorInfo.alpha * 255)
		)}`
	}

	/**
	 * Formats the color as #AARRGGBB
	 */
	toAHex() {
		return `#${toTwoDigitHex(
			Math.round(this.colorInfo.alpha * 255)
		)}${toTwoDigitHex(this.colorInfo.red * 255)}${toTwoDigitHex(
			this.colorInfo.green * 255
		)}${toTwoDigitHex(this.colorInfo.blue * 255)}`
	}

	/**
	 * Formats the color as [r, g, b], 0-1
	 */
	toDecRgbArray() {
		return [
			+this.colorInfo.red.toFixed(5),
			+this.colorInfo.green.toFixed(5),
			+this.colorInfo.blue.toFixed(5),
		]
	}
	/**
	 * Formats the color as [r, g, b], 0-255
	 */
	toRgbArray() {
		return [
			Math.round(this.colorInfo.red * 255),
			Math.round(this.colorInfo.green * 255),
			Math.round(this.colorInfo.blue * 255),
		]
	}

	/**
	 * Formats the color as [r, g, b, a] 0-1
	 */
	toDecRgbaArray() {
		return [
			+this.colorInfo.red.toFixed(5),
			+this.colorInfo.green.toFixed(5),
			+this.colorInfo.blue.toFixed(5),
			this.colorInfo.alpha,
		]
	}
	/**
	 * Formats the color as [r, g, b, a], 0-255
	 */
	toRgbaArray() {
		return [
			Math.round(this.colorInfo.red * 255),
			Math.round(this.colorInfo.green * 255),
			Math.round(this.colorInfo.blue * 255),
			Math.round(this.colorInfo.alpha * 255),
		]
	}
}
