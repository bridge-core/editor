import { isMatch } from 'bridge-common-utils'
import type { JSONPath } from 'jsonc-parser'
import type { editor, languages } from 'monaco-editor'
import { useJsoncParser } from '/@/utils/libs/useJsoncParser'
import { useMonaco } from '/@/utils/libs/useMonaco'
import { getJsonWordAtPosition } from '/@/utils/monaco/getJsonWord'
import { getArrayValueAtOffset } from '/@/utils/monaco/getArrayValue'
import { parseColor } from './parse/main'
import { App } from '/@/App'
import { BedrockProject } from '/@/components/Projects/Project/BedrockProject'

/**
 * Takes a text model and detects the locations of colors in the file
 */
export async function findColors(model: editor.ITextModel) {
	const { visit } = await useJsoncParser()
	const { Range } = await useMonaco()

	const content = model.getValue()

	const app = await App.getApp()
	const project = app.project
	if (!(project instanceof BedrockProject)) return

	const locationPatterns = await project.colorData.getDataForCurrentTab()
	const colorInfo: Promise<languages.IColorInformation | null>[] = []

	if (!locationPatterns) return []

	// Walk through the json file
	visit(content, {
		// When we reach any literal value, e.g. a string, ...
		onLiteralValue: async (
			value: any,
			offset: number,
			length: number,
			startLine: number,
			startCharacter: number,
			pathSupplier: () => JSONPath
		) => {
			// Call the path supplier and join the JSON segments into a path
			const path = pathSupplier().join('/')

			// Iterate each color format for this file type
			// Filter down to formats that are string only, as this is for literal values
			for (const format of ['hex', 'hexa', 'ahex']) {
				// Check whether the value at this JSON path matches a pattern in the valid colors file
				if (!locationPatterns[format]) continue
				const isValidColor = isMatch(path, locationPatterns[format])

				// If this is a valid color, create a promise that will resolve when the color has been parsed and the range has been determined
				if (isValidColor) {
					colorInfo.push(
						new Promise<any>(async (resolve) => {
							const position = model.getPositionAt(offset + 2)
							const { color } = await parseColor(value, {
								model,
								position,
							})
							const { range } = await getJsonWordAtPosition(
								model,
								position
							)
							if (!color) return resolve(null)

							resolve({
								color: color.colorInfo,
								range: new Range(
									range.startLineNumber,
									range.startColumn,
									range.endLineNumber,
									range.endColumn + 2
								),
							})
						})
					)
					break
				}
			}
		},
		onArrayBegin(
			offset: number,
			length: number,
			startLine: number,
			startCharacter: number,
			pathSupplier: () => JSONPath
		) {
			// Handle similarly to when approaching a literal value

			// Call the path supplier and join the JSON segments into a path
			const path = pathSupplier().join('/')

			// Iterate each color format for this file type
			for (const format of ['rgb', 'rgba', 'rgbDec', 'rgbaDec']) {
				// Check whether the value at this JSON path matches a pattern in the valid colors file
				if (!locationPatterns[format]) continue
				const isValidColor = isMatch(path, locationPatterns[format])

				// If this is a valid color, create a promise that will resolve when the color has been parsed and the range has been determined
				if (isValidColor) {
					colorInfo.push(
						new Promise<any>(async (resolve) => {
							const { range, word } = await getArrayValueAtOffset(
								model,
								offset
							)
							const { color } = await parseColor(word, {
								model,
								position: model.getPositionAt(offset),
							})
							if (!color) return resolve(null)

							resolve({
								color: color.colorInfo,
								range: new Range(
									range.startLineNumber,
									range.startColumn,
									range.endLineNumber,
									range.endColumn
								),
							})
						})
					)
					break
				}
			}
		},
	})

	// Await all promises for the color info and filter to ensure each color info contains the correct data
	return <languages.IColorInformation[]>(
		(await Promise.all(colorInfo)).filter((info) => info !== null)
	)
}
