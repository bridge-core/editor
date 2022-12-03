import type { editor, Position } from 'monaco-editor'
import { useMonaco } from '../libs/useMonaco'

/**
 * Gets the range and word of a json string from a position in a text model
 * @param model The text model that the string is in
 * @param position The position inside of the json string to get
 * @returns An object with 'word' and 'range' properties, containing the word in the json string and the range, in the model, of the string. NOTE - the column is zero-based so when using this to set monaco editor markers the columns should be adjusted to represent the entire json word
 */
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
