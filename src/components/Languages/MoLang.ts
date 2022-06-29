import type { editor, languages } from 'monaco-editor'
import { Language } from './Language'
import { CustomMoLang } from 'molang'
import { useMonaco } from '../../utils/libs/useMonaco'

export const config: languages.LanguageConfiguration = {
	comments: {
		lineComment: '#',
	},
	brackets: [
		['(', ')'],
		['[', ']'],
		['{', '}'],
	],
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
	keywords: [
		'return',
		'loop',
		'for_each',
		'break',
		'continue',
		'this',
		'function',
	],
	identifiers: [
		'v',
		't',
		'c',
		'q',
		'f',
		'a',
		'arg',
		'variable',
		'temp',
		'context',
		'query',
	],
	tokenizer: {
		root: [
			[/#.*/, 'comment'],
			[/'[^']'/, 'string'],
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

export class MoLangLanguage extends Language {
	protected molang = new CustomMoLang({})
	constructor() {
		super({
			id: 'molang',
			extensions: ['molang'],
			config,
			tokenProvider,
		})
	}

	async validate(model: editor.IModel) {
		const { editor, MarkerSeverity } = await useMonaco()

		try {
			this.molang.parse(model.getValue())
			editor.setModelMarkers(model, this.id, [])
		} catch (err: any) {
			// const token = this.molang.getParser().getLastConsumed()
			// console.log(
			// 	token?.getType(),
			// 	token?.getText(),
			// 	token?.getPosition()
			// )

			let {
				startColumn = 0,
				endColumn = Infinity,
				startLineNumber = 0,
				endLineNumber = Infinity,
			} = /*token?.getPosition() ??*/ {}

			editor.setModelMarkers(model, this.id, [
				{
					startColumn: startColumn + 1,
					endColumn: endColumn + 1,
					startLineNumber: startLineNumber + 1,
					endLineNumber: endLineNumber + 1,
					message: err.message,
					severity: MarkerSeverity.Error,
				},
			])
		}
	}
}
