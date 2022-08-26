import { useMonaco } from '/@/utils/libs/useMonaco'
import type { editor, CancellationToken, languages } from 'monaco-editor'
import { getLocation } from '/@/utils/monaco/getLocation'
import { getJsonWordAtPosition } from '/@/utils/monaco/getJsonWord'

export async function registerColorPicker() {
	const { languages, Range, Position } = await useMonaco()

	languages.registerColorProvider('json', {
		provideDocumentColors: async (
			model: editor.ITextModel,
			token: CancellationToken
		) => {
			const colorInfo: languages.IColorInformation[] = []
			const stringTest = new RegExp(
				/"[aA-zZ:_#.0-9 ]*"\s*:\s*("[aA-zZ:_#.0-9 ]*")/,
				'gi'
			)
			for (const [i, line] of model.getLinesContent().entries()) {
				// TODO - Color picker for rgba/rgb color arrays e.g. [0, 255, 0, 1]. Will need a better way of searching for the colors in the model
				// On each line, match JSON strings where there is a key, e.g. "test": "abc"
				const strings = stringTest.exec(line)

				for (const string of strings ?? []) {
					// Ignore strings without # as they will not be a hex color value
					if (string[1] !== '#') continue

					const position = new Position(
						i + 1,
						line.indexOf(string) + 3
					)
					// const location = await getLocation(model, position)
					// TODO - check location against valid color data file to ensure this actaully is a color

					let { word, range } = await getJsonWordAtPosition(
						model,
						position
					)
					const hexCode = word.slice(1)
					// Valid #RRGGBB format
					if (hexCode.length === 6) {
						const r = hexCode.substring(0, 2)
						const g = hexCode.substring(2, 4)
						const b = hexCode.substring(4, 6)
						colorInfo.push({
							range: new Range(
								range.startLineNumber,
								range.startColumn + 1,
								range.endLineNumber,
								range.endColumn + 1
							),
							color: {
								red: parseInt(r, 16) / 255,
								green: parseInt(g, 16) / 255,
								blue: parseInt(b, 16) / 255,
								alpha: 1,
							},
						})
					}
				}
			}
			return colorInfo
		},
		provideColorPresentations(
			model: editor.ITextModel,
			colorInfo: languages.IColorInformation,
			token: CancellationToken
		) {
			const r = (colorInfo.color.red * 255).toString(16)
			const g = (colorInfo.color.green * 255).toString(16)
			const b = (colorInfo.color.blue * 255).toString(16)
			return [
				{
					label: `#${r}${r.length === 1 ? 0 : ''}${g}${
						g.length === 1 ? 0 : ''
					}${b}${b.length === 1 ? 0 : ''}`.toUpperCase(),
				},
			]
		},
	})
}
