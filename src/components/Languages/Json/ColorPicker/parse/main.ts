import { Color } from '../Color'
import { parseAHex, parseHex, parseHexA } from './hex'
import { parseRgbDec, parseRgb, parseRgbaDec, parseRgba } from './rgb'
import { getLocation } from '/@/utils/monaco/getLocation'
import type { editor, Position } from 'monaco-editor'
import { isMatch } from 'bridge-common-utils'
import { App } from '/@/App'
import { BedrockProject } from '/@/components/Projects/Project/BedrockProject'

/**
 * Takes a color value and some file context to figure out the format and color info
 * @param value The string value of the color
 * @param context The file context, including the text model and the position of the color
 */
export async function parseColor(
	value: any,
	context: {
		model: editor.ITextModel
		position: Position
	}
): Promise<{ format: string; color?: Color }> {
	const app = await App.getApp()
	const project = app.project
	if (!(project instanceof BedrockProject)) return { format: 'unknown' }
	const colorData = project.colorData

	// Hex formats #RGB and #RGBA exist but don't appear in Minecraft, so we don't support parsing them

	// We should expect the value to have either no quotes or surrounding quotes
	if (
		typeof value == 'string' &&
		value[0] === '"' &&
		value[value.length - 1] === '"' &&
		value[1] === '#'
	)
		value = value.slice(1, -1)

	// Parse as a hex string, if this fails, parse as RGB array
	if (value.startsWith('#')) {
		switch (value.length) {
			case 7:
				return {
					format: 'hex',
					color: parseHex(value),
				}
			case 9: {
				// Could either be hexa or ahex here, so we check with valid color data
				const validColors = await colorData.getDataForCurrentTab()
				// If either are valid in the file...
				if (validColors) {
					const location = await getLocation(
						context.model,
						context.position,
						false
					)
					// Check if hexa is valid at this location
					if (
						validColors['hexa'] &&
						isMatch(location, validColors['hexa'])
					)
						return {
							format: 'hexa',
							color: parseHexA(value),
						}
					// Check if ahex is valid at this location
					if (
						validColors['ahex'] &&
						isMatch(location, validColors['ahex'])
					)
						return {
							format: 'ahex',
							color: parseAHex(value),
						}
				} else {
					// Otherwise, just default to hexa
					return {
						format: 'hexa',
						color: parseHexA(value),
					}
				}
			}
		}
	}

	// Parse as RGB, if this fails, just return unknown format
	let raw
	try {
		raw = JSON.parse(value)
	} catch {
		return {
			format: 'unknown',
		}
	}

	// Ignore if not an array or each value isn't a number
	if (!Array.isArray(raw) || !raw.every((val) => typeof val === 'number'))
		return {
			format: 'unknown',
		}

	if (raw.length === 3) {
		// Could either be rgb or rgbDec here, so we check with valid color data
		const validColors = await colorData.getDataForCurrentTab()
		if (validColors) {
			const location = await getLocation(context.model, context.position)
			// Check if rgb is valid at this location
			if (validColors['rgb'] && isMatch(location, validColors['rgb']))
				return {
					format: 'rgb',
					color: parseRgb(raw),
				}
			// Check if rgbDec is valid at this location
			if (
				validColors['rgbDec'] &&
				isMatch(location, validColors['rgbDec'])
			)
				return {
					format: 'rgbDec',
					color: parseRgbDec(raw),
				}
		} else {
			// Otherwise, just default to rgb
			return {
				format: 'rgb',
				color: parseRgb(raw),
			}
		}
	}
	if (raw.length === 4) {
		// Could either be rgba or rgbaDec here, so we check with valid color data
		const validColors = await colorData.getDataForCurrentTab()
		if (validColors) {
			const location = await getLocation(context.model, context.position)
			// Check if rgba is valid at this location
			if (validColors['rgba'] && isMatch(location, validColors['rgba']))
				return {
					format: 'rgba',
					color: parseRgba(raw),
				}
			// Check if rgbaDec is valid at this location
			if (
				validColors['rgbaDec'] &&
				isMatch(location, validColors['rgbaDec'])
			)
				return {
					format: 'rgbaDec',
					color: parseRgbaDec(raw),
				}
		} else {
			// Otherwise, just default to rgba
			return {
				format: 'rgba',
				color: parseRgba(raw),
			}
		}
	}

	return {
		format: 'unknown',
	}
}
