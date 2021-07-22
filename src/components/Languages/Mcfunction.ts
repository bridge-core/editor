import {
	CancellationToken,
	editor,
	languages,
	Position,
	Range,
} from 'monaco-editor'
import { BedrockProject } from '../Projects/Project/BedrockProject'
import { colorCodes } from './Common/ColorCodes'
import { Language } from './Language'
import { tokenizeCommand } from './Mcfunction/tokenize'
import { App } from '/@/App'

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
		'dialogue',
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
	},
}

const completionItemProvider: languages.CompletionItemProvider = {
	triggerCharacters: [' '],
	async provideCompletionItems(
		model: editor.ITextModel,
		position: Position,
		context: languages.CompletionContext,
		token: CancellationToken
	) {
		const project = await App.getApp().then((app) => app.project)
		if (!(project instanceof BedrockProject)) return
		const commandData = project.commandData
		await commandData.fired

		const lineUntilCursor = model
			.getLineContent(position.lineNumber)
			.slice(0, position.column - 1)

		const { tokens } = tokenizeCommand(lineUntilCursor)

		// Get the last token
		const lastToken = tokens[tokens.length - 1]

		const completionItems = await commandData.getNextCompletionItems(
			tokens.map((token) => token.word)
		)

		return {
			suggestions: completionItems.map((suggestion) => ({
				label: suggestion,
				insertText: suggestion,
				kind: languages.CompletionItemKind.Constant,
				range: new Range(
					position.lineNumber,
					(lastToken?.startColumn ?? 0) + 1,
					position.lineNumber,
					(lastToken?.endColumn ?? 0) + 1
				),
			})),
		}
	},
}

export class McfunctionLanguage extends Language {
	constructor() {
		super({
			id: 'mcfunction',
			extensions: ['mcfunction'],
			config,
			tokenProvider,
			completionItemProvider,
		})
	}

	validate() {}
}
