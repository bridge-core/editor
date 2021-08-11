import { languages } from 'monaco-editor'
import { ConfiguredJsonHighlighter } from './Highlighter'

export class ConfiguredJsonLanguage {
	highlighter = new ConfiguredJsonHighlighter()

	constructor() {
		this.setModeConfiguration()
	}

	setModeConfiguration() {
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
	}
}
