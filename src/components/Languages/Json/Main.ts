import { registerJsonSnippetProvider } from '/@/components/Snippets/Monaco'
import { registerEmbeddedMcfunctionProvider } from '/@/components/Languages/Mcfunction/WithinJson'
import { ConfiguredJsonHighlighter } from './Highlighter'
import { useMonaco } from '../../../utils/libs/useMonaco'

export class ConfiguredJsonLanguage {
	protected highlighter = new ConfiguredJsonHighlighter()

	constructor() {
		this.setModeConfiguration()
		registerEmbeddedMcfunctionProvider()
		registerJsonSnippetProvider()
	}

	getHighlighter() {
		return this.highlighter
	}

	async setModeConfiguration() {
		const { languages } = await useMonaco()

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
