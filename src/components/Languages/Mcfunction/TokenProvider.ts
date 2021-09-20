import { colorCodes } from '../Common/ColorCodes'

export const tokenProvider: any = {
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
		['{', '}', 'delimiter.curly'],
	],
	keywords: [],
	selectors: ['@a', '@e', '@p', '@r', '@s'],
	tokenizer: {
		root: [
			[/#.*/, 'comment'],

			[
				/{/,
				{
					token: '@rematch',
					next: '@embeddedJson',
					nextEmbedded: 'json',
				},
			],
			[/"[^"]*"|'[^']*'/, 'string'],
			[/\=|\,|\!|%=|\*=|\+=|-=|\/=|<|=|>|<>/, 'definition'],
			[/true|false/, 'number'],
			[/-?([0-9]+(\.[0-9]+)?)|(\~|\^-?([0-9]+(\.[0-9]+)?)?)/, 'number'],
			...colorCodes,

			[
				/[a-z_$][\w$]*/,
				{
					cases: {
						'@keywords': 'keyword',
						'@default': 'identifier',
					},
				},
			],
			[
				/@[a|p|r|e|s]/,
				{
					cases: {
						'@selectors': 'type.identifier',
						'@default': 'identifier',
					},
				},
			],
		],
		embeddedJson: [
			[
				/} *?[^,]/,
				{
					token: '@rematch',
					next: '@pop',
					nextEmbedded: '@pop',
				},
			],
		],
	},
}
