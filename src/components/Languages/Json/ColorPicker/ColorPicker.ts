import { useMonaco } from '/@/utils/libs/useMonaco'
import type { editor, CancellationToken, languages } from 'monaco-editor'
import { getJsonWordAtPosition } from '/@/utils/monaco/getJsonWord'
import { parseHex } from './format'
import { Color } from './Color'

export async function registerColorPicker() {
	const { languages, Range, Position } = await useMonaco()

	languages.registerColorProvider('json', {
		provideDocumentColors: async (
			model: editor.ITextModel,
			token: CancellationToken
		) => {
			const colorInfo: languages.IColorInformation[] = []
			const stringTest = new RegExp(
				/"[aA-zZ:_#.0-9 ]*"\s*:\s*"([aA-zZ:_#.0-9 ]*)"/,
				'gi'
			)
			for (const [i, line] of model.getLinesContent().entries()) {
				// On each line, match JSON strings where there is a key, e.g. "test": "abc"
				const strings = stringTest.exec(line)

				for (const string of strings ?? []) {
					const color = parseHex(string)
					if (!color) continue

					const position = new Position(
						i + 1,
						line.indexOf(string) + 3
					)

					let { range } = await getJsonWordAtPosition(model, position)
					colorInfo.push({
						range: new Range(
							range.startLineNumber,
							range.startColumn + 1,
							range.endLineNumber,
							range.endColumn + 1
						),
						color: color.colorInfo,
					})
				}
			}
			return colorInfo
		},
		provideColorPresentations(
			model: editor.ITextModel,
			colorInfo: languages.IColorInformation,
			token: CancellationToken
		) {
			const color = new Color(colorInfo.color)
			return [
				{
					label: color.toHex().toUpperCase(),
				},
			]
		},
	})
}
