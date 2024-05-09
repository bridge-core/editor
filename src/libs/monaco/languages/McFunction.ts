import { CancellationToken, Position, editor, languages, Range } from 'monaco-editor'
import { colorCodes } from './Language'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { Command } from '@/libs/data/bedrock/CommandData'

//@ts-ignore
window.reloadId = Math.random() // TODO: Remove

export function setupMcFunction() {
	languages.register({ id: 'mcfunction', extensions: ['.mcfunction'], aliases: ['mcfunction'] })

	languages.setLanguageConfiguration('mcfunction', {
		wordPattern: /[aA-zZ]+/,
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
				open: '"',
				close: '"',
			},
		],
	})

	//@ts-ignore
	const id = window.reloadId // TODO: Remove

	languages.registerCompletionItemProvider('mcfunction', {
		triggerCharacters: [' ', '[', '{', '=', ',', '!'],
		async provideCompletionItems(
			model: editor.ITextModel,
			position: Position,
			context: languages.CompletionContext,
			token: CancellationToken
		) {
			//@ts-ignore
			if (id !== window.reloadId) return // TODO: Remove

			if (!ProjectManager.currentProject) return
			if (!(ProjectManager.currentProject instanceof BedrockProject)) return

			const line = model.getLineContent(position.lineNumber)

			const cursor = position.column - 1

			return await getCommandCompletions(line, cursor, 0, position)
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

async function getCommandCompletions(
	line: string,
	cursor: number,
	tokenCursor: number,
	position: Position
): Promise<{ suggestions: any[] } | undefined> {
	if (!ProjectManager.currentProject || !(ProjectManager.currentProject instanceof BedrockProject)) return undefined

	const commandData = ProjectManager.currentProject.commandData

	const command = getNextWord(line, tokenCursor)

	if (command === null || cursor <= command.start + command.word.length) {
		return {
			suggestions: commandData
				.getCommands()
				.map((command) => command.commandName)
				.filter((command, index, commands) => commands.indexOf(command) === index)
				.filter((commandName) => command === null || commandName.startsWith(command.word))
				.map((commandName) => ({
					label: commandName,
					insertText: commandName,
					kind: languages.CompletionItemKind.Keyword,
					//TODO: ocumentation,
					range: new Range(
						position.lineNumber,
						(command?.start ?? 0) + 1,
						position.lineNumber,
						(command === null ? 0 : command.start + command.word.length) + 1
					),
				})),
		}
	}

	tokenCursor = command.start + command.word.length

	let possibleVariations = commandData.getCommands().filter((variation) => variation.commandName === command.word)

	return await getArgumentCompletions(line, cursor, tokenCursor, position, possibleVariations, 0)
}

async function getArgumentCompletions(
	line: string,
	cursor: number,
	tokenCursor: number,
	position: Position,
	variations: Command[],
	argumentIndex: number
): Promise<{ suggestions: any[] } | undefined> {
	if (!ProjectManager.currentProject || !(ProjectManager.currentProject instanceof BedrockProject)) return undefined

	const argument = getNextWord(line, tokenCursor)

	if (argument === null || cursor <= argument.start + argument.word.length) {
		const suggestions: any[] = []

		for (const variation of variations) {
			const argumentType = variation.arguments[argumentIndex]

			if (argumentType.type === 'string') {
				if (argumentType.additionalData?.values) {
					for (const value of argumentType.additionalData!.values as string[]) {
						if (argument && !value.startsWith(argument.word)) continue

						suggestions.push({
							label: value,
							insertText: value,
							kind: languages.CompletionItemKind.Keyword,
							//TODO: ocumentation,
							range: new Range(
								position.lineNumber,
								(argument?.start ?? cursor) + 1,
								position.lineNumber,
								(argument === null ? cursor : argument.start + argument.word.length) + 1
							),
						})
					}
				}

				if (argumentType.additionalData?.schemaReference) {
					const data = await ProjectManager.currentProject.schemaData.get(
						argumentType.additionalData.schemaReference.substring(1)
					)

					for (const value of data.enum as string[]) {
						if (argument && !value.startsWith(argument.word)) continue

						suggestions.push({
							label: value,
							insertText: value,
							kind: languages.CompletionItemKind.Keyword,
							//TODO: ocumentation,
							range: new Range(
								position.lineNumber,
								(argument?.start ?? cursor) + 1,
								position.lineNumber,
								(argument === null ? cursor : argument.start + argument.word.length) + 1
							),
						})
					}
				}
			}

			if (argumentType.type === 'boolean') {
				for (const value of ['true', 'false']) {
					if (argument && !value.startsWith(argument.word)) continue

					suggestions.push({
						label: value,
						insertText: value,
						kind: languages.CompletionItemKind.Keyword,
						//TODO: ocumentation,
						range: new Range(
							position.lineNumber,
							(argument?.start ?? cursor) + 1,
							position.lineNumber,
							(argument === null ? cursor : argument.start + argument.word.length) + 1
						),
					})
				}
			}

			if (argumentType.type === 'selector') {
				for (const selector of ['p', 'r', 'a', 'e', 's', 'initiator']) {
					if (argument && !('@' + selector).startsWith(argument.word)) continue

					suggestions.push({
						label: '@' + selector,
						insertText: '@' + selector,
						kind: languages.CompletionItemKind.Keyword,
						//TODO: ocumentation,
						range: new Range(
							position.lineNumber,
							(argument?.start ?? cursor) + 1,
							position.lineNumber,
							(argument === null ? cursor : argument.start + argument.word.length) + 1
						),
					})
				}
			}
		}

		return {
			suggestions,
		}
	}

	tokenCursor = argument.start + argument.word.length

	variations = variations.filter(
		(variation) =>
			matchArgument(argument, variation.arguments[argumentIndex]) &&
			variation.arguments.length > argumentIndex + 1
	)

	if (variations.length === 0) return undefined

	return getArgumentCompletions(line, cursor, tokenCursor, position, variations, argumentIndex + 1)
}

interface Token {
	word: string
	start: number
}

function matchArgument(argument: Token, type: any): boolean {
	if (type === undefined) return false

	if (type.type === 'string') return true
	//TODO: match enum?

	if (type.type === 'boolean' && /^(true|false)$/) return true

	//TODO: make selector matching more robust?
	if (type.type === 'selector' && /^@(a|e|r|s|p|(initiator))/.test(argument.word)) return true

	return false
}

function getNextWord(line: string, cursor: number): Token | null {
	let initialSpaceCount = 0

	while (line[initialSpaceCount + cursor] === ' ') initialSpaceCount++

	let spaceIndex = line.substring(cursor + initialSpaceCount).indexOf(' ') + cursor + initialSpaceCount
	if (spaceIndex === cursor + initialSpaceCount - 1) spaceIndex = line.length

	if (spaceIndex <= cursor + initialSpaceCount) return null

	return {
		word: line.substring(cursor + initialSpaceCount, spaceIndex),
		start: cursor + initialSpaceCount,
	}
}
