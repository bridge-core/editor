import { CancellationToken, Position, editor, languages, Range } from 'monaco-editor'
import { colorCodes } from '../Language'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { ArgumentContext, Token, getContext } from './Parser'

//@ts-ignore
window.reloadId = Math.random() // TODO: Remove

export function setupMcFunction() {
	languages.register({ id: 'mcfunction', extensions: ['.mcfunction'], aliases: ['mcfunction'] })

	languages.setLanguageConfiguration('mcfunction', {
		wordPattern: /[aA-zZ]/, // Hack to make autocompletions work within an empty selector. Hopefully there are now implicit side effects.
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
	})

	//@ts-ignore
	const id = window.reloadId // TODO: Remove

	languages.registerCompletionItemProvider('mcfunction', {
		triggerCharacters: [' ', '[', '{', '=', ',', '!', '@', '\n'],

		async provideCompletionItems(
			model: editor.ITextModel,
			position: Position,
			context: languages.CompletionContext,
			token: CancellationToken
		) {
			//@ts-ignore
			if (id !== window.reloadId) return // TODO: Remove

			if (!(ProjectManager.currentProject instanceof BedrockProject)) return undefined

			const line = model.getLineContent(position.lineNumber)

			const cursor = position.column - 1

			const contexts = await getContext(line, cursor)
			console.log(contexts)

			let completions: languages.CompletionItem[] = []

			const commandData = ProjectManager.currentProject.commandData

			for (const context of contexts) {
				if (context.kind === 'command') {
					const commands = commandData
						.getCommands()
						.filter(
							(command, index, commands) =>
								commands.findIndex(
									(otherCommand) => command.commandName === otherCommand.commandName
								) === index
						)

					completions = completions.concat(
						makeCompletions(
							commands.map((command) => command.commandName),
							commands.map((command) => command.description),
							languages.CompletionItemKind.Enum,
							position,
							context.token
						)
					)
				}
			}

			return {
				suggestions: completions,
			}

			// return await getCommandCompletions(line, cursor, 0, position)
		},
	})

	languages.registerSignatureHelpProvider('mcfunction', {
		signatureHelpTriggerCharacters: [' ', '[', '{', '=', ',', '!', '@', '\n'],

		async provideSignatureHelp(model, position, token, _) {
			//@ts-ignore
			if (id !== window.reloadId) return // TODO: Remove

			const line = model.getLineContent(position.lineNumber)

			const cursor = position.column - 1

			const contexts = await getContext(line, cursor)
			console.log(contexts)

			let signatures: languages.SignatureInformation[] = []

			for (const context of contexts) {
				if (context.kind === 'argument') {
					const argumentContext = <ArgumentContext>context

					signatures = signatures.concat(
						argumentContext.variations.map((variation) => ({
							label: `${variation.commandName} => ${
								variation.arguments[argumentContext.argumentIndex].argumentName
							}: ${variation.arguments[argumentContext.argumentIndex].type}`,
							parameters: [],
							documentation: variation.description,
						}))
					)
				}
			}

			return {
				value: {
					activeParameter: 0,
					activeSignature: 0,
					signatures,
				},
				dispose() {},
			}
		},
	})

	ProjectManager.updatedCurrentProject.on(() => {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		updateTokensProvider(
			ProjectManager.currentProject.commandData
				.getCommands()
				.map((command) => command.commandName)
				.filter((command, index, commands) => commands.indexOf(command) === index),
			ProjectManager.currentProject.commandData
				.getSelectorArguments()
				.map((argument) => argument.argumentName)
				.filter((argument, index, argumentArray) => argumentArray.indexOf(argument) === index)
		)
	})

	updateTokensProvider([], [])

	if (ProjectManager.currentProject && ProjectManager.currentProject instanceof BedrockProject)
		updateTokensProvider(
			ProjectManager.currentProject.commandData
				.getCommands()
				.map((command) => command.commandName)
				.filter((command, index, commands) => commands.indexOf(command) === index),
			ProjectManager.currentProject.commandData
				.getSelectorArguments()
				.map((argument) => argument.argumentName)
				.filter((argument, index, argumentArray) => argumentArray.indexOf(argument) === index)
		)
}

function updateTokensProvider(commands: string[], selectorArguments: string[]) {
	languages.setMonarchTokensProvider('mcfunction', {
		brackets: [
			{
				open: '(',
				close: ')',
				token: 'delimiter.parenthesis',
			},
			{
				open: '[',
				close: ']',
				token: 'delimiter.square',
			},
			{
				open: '{',
				close: '}',
				token: 'delimiter.curly',
			},
		],
		keywords: commands,
		selectors: ['@a', '@e', '@p', '@r', '@s', '@initiator'],
		targetSelectorArguments: selectorArguments,

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
	})
}

function makeCompletions(
	options: string[],
	detail: string[] | undefined,
	kind: languages.CompletionItemKind,
	position: Position,
	token?: Token | null
) {
	if (!token) {
		return options.map((option, index) => ({
			label: option,
			insertText: option,
			detail: detail ? detail[index] : undefined,
			kind,
			range: new Range(position.lineNumber, position.column, position.lineNumber, position.column),
		}))
	}

	return options
		.filter((option) => option.startsWith(token.word))
		.map((option, index) => ({
			label: option,
			insertText: option,
			detail: detail ? detail[index] : undefined,
			kind,
			range: new Range(
				position.lineNumber,
				position.column,
				position.lineNumber,
				token.start + token.word.length + 1
			),
		}))
}
