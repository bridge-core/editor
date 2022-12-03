import { Color } from '../Color'

/**
 * Convert a single hex digit to denary value
 * @param index The index of the hex string to convert
 */
const fromHex = (hex: string, index: number) =>
	parseInt(hex.slice(index, index + 1), 16)

export function parseHex(hex: string) {
	const r = 16 * fromHex(hex, 1) + fromHex(hex, 2)
	const g = 16 * fromHex(hex, 3) + fromHex(hex, 4)
	const b = 16 * fromHex(hex, 5) + fromHex(hex, 6)
	return new Color({
		red: r / 255,
		green: g / 255,
		blue: b / 255,
		alpha: 1,
	})
}

export function parseAHex(hex: string) {
	const a = 16 * fromHex(hex, 1) + fromHex(hex, 2)
	const r = 16 * fromHex(hex, 3) + fromHex(hex, 4)
	const g = 16 * fromHex(hex, 5) + fromHex(hex, 6)
	const b = 16 * fromHex(hex, 7) + fromHex(hex, 8)
	return new Color({
		red: r / 255,
		green: g / 255,
		blue: b / 255,
		alpha: a / 255,
	})
}

export function parseHexA(hex: string) {
	const r = 16 * fromHex(hex, 1) + fromHex(hex, 2)
	const g = 16 * fromHex(hex, 3) + fromHex(hex, 4)
	const b = 16 * fromHex(hex, 5) + fromHex(hex, 6)
	const a = 16 * fromHex(hex, 7) + fromHex(hex, 8)
	return new Color({
		red: r / 255,
		green: g / 255,
		blue: b / 255,
		alpha: a / 255,
	})
}

export function toTwoDigitHex(value: number) {
	const hex = value.toString(16)
	return hex.length !== 2 ? '0' + hex : hex
}
