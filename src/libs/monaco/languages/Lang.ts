import { languages } from 'monaco-editor'
import { colorCodes } from './Language'

export function setupLang() {
	languages.register({ id: 'lang', extensions: ['.lang'], aliases: ['lang'] })

	languages.setLanguageConfiguration('lang', {
		comments: {
			lineComment: '##',
		},
	})

	languages.setMonarchTokensProvider('lang', {
		tokenizer: {
			root: [[/##.*/, 'comment'], [/=|\.|:/, 'definition'], ...colorCodes],
		},
	})
}
