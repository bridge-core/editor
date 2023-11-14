import type { editor, Position, Range } from 'monaco-editor'

export function isWithinQuotes(model: editor.ITextModel, position: Position) {
	let line: string
	try {
		line = model.getLineContent(position.lineNumber)
	} catch {
		return false
	}

	const wordStart = getPreviousQuote(line, position.column)
	const wordEnd = getNextQuote(line, position.column)
	return wordStart && wordEnd
}

function getNextQuote(line: string, startIndex: number) {
	for (let i = startIndex - 1; i < line.length; i++) {
		if (line[i] === '"') return true
	}
	return false
}
function getPreviousQuote(line: string, startIndex: number) {
	for (let i = startIndex - 2; i > 0; i--) {
		if (line[i] === '"') return true
	}
	return false
}
