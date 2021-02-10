import { languages } from 'monaco-editor'
import { addLanguage } from './addLanguage'

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

addLanguage({
	id: 'lang',
	extensions: ['lang'],
	config,
	tokenProvider,
})
