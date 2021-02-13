import { languages } from 'monaco-editor'
import { Language } from './Language'

export const config: languages.LanguageConfiguration = {
	comments: {
		lineComment: '##',
	},
}

export const tokenProvider = {
	tokenizer: {
		root: [
			[/##.*/, 'comment'],
			[/=|\.|:/, 'definition'],
		],
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
