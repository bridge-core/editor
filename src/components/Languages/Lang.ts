import type { languages } from 'monaco-editor'
import { colorCodes } from './Common/ColorCodes'
import { Language } from './Language'

export const config: languages.LanguageConfiguration = {
	comments: {
		lineComment: '##',
	},
}

export const tokenProvider = {
	tokenizer: {
		root: [[/##.*/, 'comment'], [/=|\.|:/, 'definition'], ...colorCodes],
	},
}

export class LangLanguage extends Language {
	constructor() {
		super({
			id: 'lang',
			extensions: ['lang'],
			config,
			tokenProvider,
		})
	}

	validate() {}
}
