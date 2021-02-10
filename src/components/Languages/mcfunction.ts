import { languages } from 'monaco-editor'
import { addLanguage } from './addLanguage'

export const config: languages.LanguageConfiguration = {
	comments: {
		lineComment: '#',
	},
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
			open: '"',
			close: '"',
		},
	],
}

export const tokenProvider = {
	brackets: [
		['(', ')', 'delimiter.parenthesis'],
		['[', ']', 'delimiter.square'],
		['{', '}', 'delimiter.curly'],
	],
	keywords: [
		'alwaysday',
		'ability',
		'clear',
		'camerashake',
		'clearspawnpoint',
		'clone',
		'difficulty',
		'effect',
		'event',
		'enchant',
		'execute',
		'fill',
		'fog',
		'function',
		'gamemode',
		'gamerule',
		'give',
		'kick',
		'kill',
		'locate',
		'list',
		'me',
		'mobevent',
		'music',
		'particle',
		'playsound',
		'playanimation',
		'ride',
		'reload',
		'replaceitem',
		'say',
		'schedule',
		'score',
		'scoreboard',
		'setblock',
		'setmaxplayers',
		'structure',
		'setworldspawn',
		'spawnpoint',
		'spreadplayers',
		'stopsound',
		'summon',
		'tag',
		'teleport',
		'tell',
		'tellraw',
		'testfor',
		'testforblock',
		'testforblocks',
		'tickingarea',
		'time',
		'title',
		'titleraw',
		'toggledownfall',
		'tp',
		'w',
		'weather',
		'xp',
	],
	selectors: ['@a', '@e', '@p', '@r', '@s'],
	tokenizer: {
		root: [
			[/#.*/, 'comment'],
			[/"[^"]*"|'[^']*'/, 'string'],
			[/\=|\,|\!|%=|\*=|\+=|-=|\/=|<|=|>|<>/, 'definition'],
			[/true|false/, 'number'],
			[/-?([0-9]+(\.[0-9]+)?)|(\~|\^-?([0-9]+(\.[0-9]+)?)?)/, 'number'],

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
	},
}

addLanguage({
	id: 'mcfunction',
	extensions: ['mcfunction'],
	config,
	tokenProvider,
})
