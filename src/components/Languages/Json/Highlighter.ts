import { languages } from 'monaco-editor'

languages.setMonarchTokensProvider('json', {
	// Set defaultToken to invalid to see what you do not tokenize yet
	defaultToken: 'invalid',
	tokenPostfix: '.json',

	keywords: ['false', 'true', 'class'],
	typeKeywords: ['null'],
	stringKeywords: ['minecraft'],
	stringTypeIdentifiers: [
		'description',
		'components',
		'events',
		'permutations',
		'component_groups',
		'format_version',
	],

	// we include these common regular expressions
	symbols: /[=><!~?:&|+\-*\/\^%]+/,
	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	digits: /\d+(_+\d+)*/,

	// The main tokenizer for our languages
	tokenizer: {
		root: [[/[{}]/, 'delimiter.bracket'], { include: 'common' }],

		common: [
			// identifiers and keywords
			[
				/[a-z_$][\w$]*/,
				{
					cases: {
						'@typeKeywords': 'keyword',
						'@keywords': 'keyword',
						'@default': 'identifier',
					},
				},
			],

			// whitespace
			{ include: '@whitespace' },

			// numbers
			[/(@digits)[eE]([\-+]?(@digits))?/, 'number.float'],
			[/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, 'number.float'],
			[/(@digits)/, 'number'],

			// delimiter: after number because of .\d floats
			[/[:,]/, 'delimiter'],

			// strings
			[/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
			[/'([^'\\]|\\.)*$/, 'string.invalid'], // non-teminated string
			[
				/"\//,
				{
					token: 'identifier',
					next: '@embeddedCommand',
					nextEmbedded: 'mcfunction',
				},
			],
			[/"/, 'identifier', '@string'],
		],

		embeddedCommand: [
			[/"/, { token: 'identifier', next: '@pop', nextEmbedded: '@pop' }],
		],

		whitespace: [
			[/[ \t\r\n]+/, ''],
			[/\/\*\*(?!\/)/, 'comment.doc', '@jsdoc'],
			[/\/\*/, 'comment', '@comment'],
			[/\/\/.*$/, 'comment'],
		],

		comment: [
			[/[^\/*]+/, 'comment'],
			[/\*\//, 'comment', '@pop'],
			[/[\/*]/, 'comment'],
		],

		jsdoc: [
			[/[^\/*]+/, 'comment.doc'],
			[/\*\//, 'comment.doc', '@pop'],
			[/[\/*]/, 'comment.doc'],
		],

		string: [
			[
				/[^\\"\\:]+/,
				{
					cases: {
						'@stringKeywords': 'keyword',
						'@stringTypeIdentifiers': 'type.identifier',
						'@default': 'string',
					},
				},
			],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, 'identifier', '@pop'],
		],
		command: [
			[/[^\\"]+/, 'keyword'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, 'identifier', '@pop'],
		],

		bracketCounting: [
			[/\{/, 'delimiter.bracket', '@bracketCounting'],
			[/\}/, 'delimiter.bracket', '@pop'],
			{ include: 'common' },
		],
	},
})
