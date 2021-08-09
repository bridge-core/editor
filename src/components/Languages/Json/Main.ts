import { languages } from 'monaco-editor'
import './Highlighter'

languages.json.jsonDefaults.setModeConfiguration({
	colors: false,
	tokens: false,
	completionItems: true,
	diagnostics: true,
	hovers: true,
	documentFormattingEdits: true,
	documentRangeFormattingEdits: true,
	documentSymbols: true,
	foldingRanges: true,
	selectionRanges: true,
})
