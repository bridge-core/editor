import { languages } from 'monaco-editor'
import { ConfiguredJsonHighlighter } from './Highlighter'

export class ConfiguredJsonLanguage {
	protected highlighter = new ConfiguredJsonHighlighter()

	constructor() {
		this.setModeConfiguration()
	}

	getHighlighter() {
		return this.highlighter
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
