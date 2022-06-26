import type { editor, Position } from 'monaco-editor'
import { useMonaco } from '../useMonaco'

export async function getJsonWordAtPosition(
	model: editor.ITextModel,
	position: Position
) {
	const { Range } = await useMonaco()
	const line = model.getLineContent(position.lineNumber)

	const wordStart = getPreviousQuote(line, position.column)
	const wordEnd = getNextQuote(line, position.column)
	return {
		word: line.substring(wordStart, wordEnd),
		range: new Range(
			position.lineNumber,
			wordStart,
			position.lineNumber,
			wordEnd
		),
	}
}

function getNextQuote(line: string, startIndex: number) {
	for (let i = startIndex - 1; i < line.length; i++) {
		if (line[i] === '"') return i
	}
	return line.length
}
function getPreviousQuote(line: string, startIndex: number) {
	for (let i = startIndex - 2; i > 0; i--) {
		if (line[i] === '"') return i + 1
	}
	return 0
}
