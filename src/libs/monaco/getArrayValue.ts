import type { editor } from 'monaco-editor'
import { useMonaco } from '../libs/useMonaco'

export async function getArrayValueAtOffset(
	model: editor.ITextModel,
	offset: number
) {
	const { Range } = await useMonaco()
	const content = model.getValue()

	const arrStart = model.getPositionAt(
		getPreviousSquareBracket(content, offset)
	)
	const arrEnd = model.getPositionAt(getNextSquareBracket(content, offset))
	const range = new Range(
		arrStart.lineNumber,
		arrStart.column,
		arrEnd.lineNumber,
		arrEnd.column + 1
	)

	return {
		word: model.getValueInRange(range),
		range,
	}
}

function getNextSquareBracket(content: string, offset: number) {
	for (let i = offset; i < content.length; i++) {
		if (content[i] === ']') return i
	}
	return content.length
}
function getPreviousSquareBracket(content: string, offset: number) {
	for (let i = offset; i > 0; i--) {
		if (content[i] === '[') return i
	}
	return 0
}
