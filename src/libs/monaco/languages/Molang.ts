import { MarkerSeverity, editor, languages } from 'monaco-editor'
import { CustomMolang } from '@bridge-editor/molang'

export function setupMolang() {
	languages.register({ id: 'molang', extensions: ['.molang'], aliases: ['molang'] })

	languages.setLanguageConfiguration('lang', {
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
	})

	languages.setMonarchTokensProvider('lang', {
		ignoreCase: true,
		brackets: [
			{ open: '(', close: ')', token: 'delimiter.parenthesis' },
			{ open: '[', close: ']', token: 'delimiter.square' },
			{ open: '{', close: '}', token: 'delimiter.curly' },
		],
		keywords: ['return', 'loop', 'for_each', 'break', 'continue', 'this', 'function'],
		identifiers: ['v', 't', 'c', 'q', 'f', 'a', 'arg', 'variable', 'temp', 'context', 'query'],
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
	})

	const molang = new CustomMolang({})

	editor.onDidChangeModelLanguage(({ model, oldLanguage }) => {
		model.onDidChangeContent(() => {
			try {
				molang.parse(model.getValue())
				editor.setModelMarkers(model, 'molang', [])
			} catch (err: any) {
				let { startColumn = 0, endColumn = Infinity, startLineNumber = 0, endLineNumber = Infinity } = {}

				editor.setModelMarkers(model, 'molang', [
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
		})
	})
}
