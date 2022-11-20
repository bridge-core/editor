import { Color } from '../Color'

export function parseRgb(rgbArr: number[]) {
	return new Color({
		red: rgbArr[0] / 255,
		green: rgbArr[1] / 255,
		blue: rgbArr[2] / 255,
		alpha: 1,
	})
}

export function parseRgba(rgbArr: number[]) {
	return new Color({
		red: rgbArr[0] / 255,
		green: rgbArr[1] / 255,
		blue: rgbArr[2] / 255,
		alpha: rgbArr[3] / 255,
	})
}

export function parseRgbDec(rgbArr: number[]) {
	return new Color({
		red: rgbArr[0],
		green: rgbArr[1],
		blue: rgbArr[2],
		alpha: 1,
	})
}

export function parseRgbaDec(rgbArr: number[]) {
	return new Color({
		red: rgbArr[0],
		green: rgbArr[1],
		blue: rgbArr[2],
		alpha: rgbArr[3],
	})
}
