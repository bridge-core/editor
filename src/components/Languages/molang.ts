import { languages } from 'monaco-editor'
import { addLanguage } from './addLanguage'

export const config: languages.LanguageConfiguration = {
	autoClosingPairs: [
		{
			open: '(',
			close: ')',
		},
		{
			open: '[',
			close: ']',
		},
		{
			open: '{',
			close: '}',
		},
		{
			open: "'",
			close: "'",
		},
	],
}

export const tokenProvider = {
	ignoreCase: true,
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
		['{', '}', 'delimiter.curly'],
	],
	keywords: ['return', 'loop', 'for_each', 'break', 'continue', 'this'],
	identifiers: ['v', 't', 'c', 'q', 'variable', 'temp', 'context', 'query'],
	tokenizer: {
		root: [
			[/'.*'|'.*'/, 'string'],
			[/[0-9]+(\.[0-9]+)?/, 'number'],
			[/true|false/, 'number'],
			[/\=|\,|\!|%=|\*=|\+=|-=|\/=|<|=|>|<>/, 'definition'],
			[
				/[a-z_$][\w$]*/,
				{
					cases: {
						'@keywords': 'keyword',
						'@identifiers': 'type.identifier',
						'@default': 'identifier',
					},
				},
			],
		],
	},
}

addLanguage({
	id: 'molang',
	extensions: ['molang'],
	config,
	tokenProvider,
})
