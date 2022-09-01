import { Color } from './Color'

export const colorFormats = [
	'hexa',
	'ahex',
	'hex',
	'rgbDec',
	'rgbaDec',
	'rgb',
	'rgba',
]

export function parseColor(format: string, color: string) {
	switch (format) {
		case 'ahex':
		case 'hexa':
		case 'hex':
			return parseHex(color)
		case 'rgb':
		case 'rgba':
			return parseRgb(color)
	}
}

export function parseHex(hex: string) {
	// Ignore strings without # as they will not be a hex color value
	if (!hex.startsWith('#')) return

	// Empty value
	if (hex.length === 0) return

	/**
	 * Convert a single hex digit to denary value
	 * @param index The index of the hex string to convert
	 */
	const fromHex = (index: number) => parseInt(hex.slice(index, index + 1), 16)

	// #RGB
	if (hex.length === 4) {
		const r = fromHex(1)
		const g = fromHex(2)
		const b = fromHex(3)
		return new Color({
			red: r / 16,
			green: g / 16,
			blue: b / 16,
			alpha: 1,
		})
	}
	// #RGBA
	if (hex.length === 5) {
		const r = fromHex(1)
		const g = fromHex(2)
		const b = fromHex(3)
		const a = fromHex(4)
		return new Color({
			red: r / 16,
			green: g / 16,
			blue: b / 16,
			alpha: a / 16,
		})
	}
	// #RRGGBB
	if (hex.length === 7) {
		const r = 16 * fromHex(1) + fromHex(2)
		const g = 16 * fromHex(3) + fromHex(4)
		const b = 16 * fromHex(5) + fromHex(6)
		return new Color({
			red: r / 255,
			green: g / 255,
			blue: b / 255,
			alpha: 1,
		})
	}
	// #RRGGBBAA
	if (hex.length === 9) {
		const r = 16 * fromHex(1) + fromHex(2)
		const g = 16 * fromHex(3) + fromHex(4)
		const b = 16 * fromHex(5) + fromHex(6)
		const a = 16 * fromHex(7) + fromHex(8)
		return new Color({
			red: r / 255,
			green: g / 255,
			blue: b / 255,
			alpha: a / 255,
		})
	}

	// Invalid length
	return
}

export function toTwoDigitHex(value: number) {
	const hex = value.toString(16)
	return hex.length !== 2 ? '0' + hex : hex
}

export function parseRgb(color: string) {
	let raw
	try {
		raw = JSON.parse(color)
	} catch {
		return
	}

	// Ignore if not an array or is not a valid length
	if (!Array.isArray(raw) || (raw.length !== 3 && raw.length !== 4)) return

	// Decimal array, 0-1
	if (raw[0] <= 1 && raw[1] <= 1 && raw[2] <= 1) {
		return new Color({
			red: raw[0],
			green: raw[1],
			blue: raw[2],
			alpha: raw[3] ?? 1,
		})
	}

	return new Color({
		red: raw[0] / 255,
		green: raw[1] / 255,
		blue: raw[2] / 255,
		alpha: raw[3] ? raw[3] / 255 : 1,
	})
}
