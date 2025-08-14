import { colorCodes } from '../Common/ColorCodes'

export const tokenProvider: any = {
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
		['{', '}', 'delimiter.curly'],
	],
	keywords: [],
	selectors: ['@a', '@e', '@p', '@r', '@s', '@initiator', '@n'],
	targetSelectorArguments: [],

	tokenizer: {
		root: [
			[/#.*/, 'comment'],

			[
				/\{/,
				{
					token: 'delimiter.bracket',
					bracket: '@open',
					next: '@embeddedJson',
				},
			],
			[
				/\[/,
				{
					token: 'delimiter.bracket',
					next: '@targetSelectorArguments',
					bracket: '@open',
				},
			],
			{ include: '@common' },
			...colorCodes,

			[
				/[a-z_][\w\/]*/,
				{
					cases: {
						'@keywords': 'keyword',
						'@default': 'identifier',
					},
				},
			],
			[
				/(@[a-z]+)/,
				{
					cases: {
						'@selectors': 'type.identifier',
						'@default': 'identifier',
					},
				},
			],
		],

		common: [
			[/(\\)?"[^"]*"|'[^']*'/, 'string'],
			[/\=|\,|\!|%=|\*=|\+=|-=|\/=|<|=|>|<>/, 'definition'],
			[/true|false/, 'number'],
			[/-?([0-9]+(\.[0-9]+)?)|((\~|\^)-?([0-9]+(\.[0-9]+)?)?)/, 'number'],
		],

		embeddedJson: [
			[/\{/, 'delimiter.bracket', '@embeddedJson'],
			[/\}/, 'delimiter.bracket', '@pop'],
			{ include: '@common' },
		],
		targetSelectorArguments: [
			[/\]/, { token: '@brackets', bracket: '@close', next: '@pop' }],
			[
				/{/,
				{
					token: '@brackets',
					bracket: '@open',
					next: '@targetSelectorScore',
				},
			],
			[
				/[a-z_][\w\/]*/,
				{
					cases: {
						'@targetSelectorArguments': 'variable',
						'@default': 'identifier',
					},
				},
			],
			{ include: '@common' },
		],
		targetSelectorScore: [
			[/}/, { token: '@brackets', bracket: '@close', next: '@pop' }],
			{ include: '@common' },
		],
	},
}
