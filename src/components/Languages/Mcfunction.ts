import debounce from 'lodash.debounce'
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
import './Mcfunction/WithinJson'

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
			suggestions: completionItems.map(
				({ label, insertText, documentation, kind }) => ({
					label: label ?? insertText,
					insertText,
					documentation,
					kind,
					range: new Range(
						position.lineNumber,
						(lastToken?.startColumn ?? 0) + 1,
						position.lineNumber,
						(lastToken?.endColumn ?? 0) + 1
					),
				})
			),
		}
	},
}

const loadCommands = debounce(async (lang: McfunctionLanguage) => {
	const app = await App.getApp()
	await app.projectManager.fired

	const project = app.project
	if (!(project instanceof BedrockProject)) return

	await project.commandData.fired
	const commands = await project.commandData.allCommands(
		undefined,
		!project.compilerManager.hasFired
	)
	tokenProvider.keywords = commands.map((command) => command)

	lang.updateTokenProvider(tokenProvider)
}, 3000)

export class McfunctionLanguage extends Language {
	constructor() {
		super({
			id: 'mcfunction',
			extensions: ['mcfunction'],
			config,
			tokenProvider,
			completionItemProvider,
		})

		this.disposables.push(
			App.eventSystem.on('fileChange', () => loadCommands(this))
		)
	}

	onModelAdded(model: editor.ITextModel) {
		const isLangFor = super.onModelAdded(model)
		if (!isLangFor) return false

		loadCommands(this)

		return true
	}

	validate() {}
}
