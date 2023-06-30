export const tokenProvider: any = {
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
		'math',
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
