import { useMonaco } from '/@/utils/libs/useMonaco'
import type { editor, CancellationToken, languages } from 'monaco-editor'
import { Color } from './Color'
import { findColors } from './findColors'
import { parseColor } from './parse/main'

export async function registerColorPicker() {
	const { languages, Position, Range } = await useMonaco()

	languages.registerColorProvider('json', {
		provideDocumentColors: async (
			model: editor.ITextModel,
			token: CancellationToken
		) => {
			return await findColors(model)
		},
		provideColorPresentations: async (
			model: editor.ITextModel,
			colorInfo: languages.IColorInformation,
			token: CancellationToken
		) => {
			const newColor = new Color(colorInfo.color)
			const value = model.getValueInRange(colorInfo.range)
			const position = new Position(
				colorInfo.range.startLineNumber,
				colorInfo.range.startColumn + 2
			)

			// We need to decide which format this color is supposed to be in by doing 2 things:
			// 1. Parse the value to find the format
			// 2. Check the json path against valid locations to confirm the format, if necessary

			/**
			 * Takes an array as a string and inserts values into the array while preserving whitespace
			 */
			const insertToStringArray = (arr: string, newValues: any[]) => {
				const valueTest = /(\d+(?:\.\d*)?)/gim
				const split = arr.split(',')
				let newArr = ''
				// If the number of values to replace != the number of values available replace just return the orignal value
				if (split.length !== newValues.length) return arr
				for (const [i, value] of newValues.entries()) {
					// Get the first value to replace
					const toReplace = split[i].match(valueTest)
					// If there is something to replace, replace it
					if (toReplace && toReplace[0])
						newArr += `${split[i].replace(toReplace[0], value)}${
							i + 1 === newValues.length ? '' : ',' // Comma after value if not last element
						}`
				}
				return newArr
			}

			const { format } = await parseColor(value, {
				model,
				position,
			})

			switch (format) {
				case 'hex':
					return [
						{
							label: `"${newColor.toHex().toUpperCase()}"`,
						},
					]
				case 'hexa':
					return [
						{
							label: `"${newColor.toHexA().toUpperCase()}"`,
						},
					]
				case 'ahex':
					return [
						{
							label: `"${newColor.toAHex().toUpperCase()}"`,
						},
					]

				case 'rgbDec':
					return [
						{
							label: `[${newColor.toDecRgbArray().join(', ')}]`,
							textEdit: {
								range: colorInfo.range,
								text: insertToStringArray(
									value,
									newColor.toDecRgbArray()
								),
							},
						},
					]
				case 'rgb':
					return [
						{
							label: `[${newColor.toRgbArray().join(', ')}]`,
							textEdit: {
								range: colorInfo.range,
								text: insertToStringArray(
									value,
									newColor.toRgbArray()
								),
							},
						},
					]
				case 'rgbaDec':
					return [
						{
							label: `[${newColor.toDecRgbaArray().join(', ')}]`,
							textEdit: {
								range: colorInfo.range,
								text: insertToStringArray(
									value,
									newColor.toDecRgbaArray()
								),
							},
						},
					]
				case 'rgba':
					return [
						{
							label: `[${newColor.toRgbaArray().join(', ')}]`,
							textEdit: {
								range: colorInfo.range,
								text: insertToStringArray(
									value,
									newColor.toRgbaArray()
								),
							},
						},
					]

				default:
					// If all fails, don't do anything to be safe
					return [
						{
							label: '',
							textEdit: {
								range: new Range(0, 0, 0, 0),
								text: '',
							},
						},
					]
			}
		},
	})
}
