import { CancellationToken, Position, editor, languages, Range } from 'monaco-editor'
import { colorCodes } from './Language'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { Argument } from '@/libs/data/bedrock/CommandData'
import { Data } from '@/libs/data/Data'

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

	const id = window.reloadId // TODO: Remove

	languages.registerCompletionItemProvider('mcfunction', {
		triggerCharacters: [' ', '[', '{', '=', ',', '!'],
		async provideCompletionItems(
			model: editor.ITextModel,
			position: Position,
			context: languages.CompletionContext,
			token: CancellationToken
		) {
			if (id !== window.reloadId) return // TODO: Remove

			if (!ProjectManager.currentProject) return
			if (!(ProjectManager.currentProject instanceof BedrockProject)) return

			const commandData = ProjectManager.currentProject.commandData

			const line = model.getLineContent(position.lineNumber)

			const cursor = position.column - 1

			let tokenCursor = 0

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

			return undefined

			// const parsedTokens = parse(tokens)

			// if (tokens.length === 0 || (tokens.length === 1 && tokens[0].end === line.length)) {
			// 	let partialCommand = tokens[0]?.word || ''

			// 	return {
			// 		suggestions: commandData
			// 			.getCommands()
			// 			.map((command) => command.commandName)
			// 			.filter((command, index, commands) => commands.indexOf(command) === index)
			// 			.filter((command) => partialCommand === '' || command.startsWith(partialCommand))
			// 			.map((command) => ({
			// 				label: command,
			// 				insertText: command.substring(partialCommand.length),
			// 				kind: languages.CompletionItemKind.Keyword,
			// 				//TODO: ocumentation,
			// 				range: new Range(
			// 					position.lineNumber,
			// 					position.column,
			// 					position.lineNumber,
			// 					position.column
			// 				),
			// 			})),
			// 	}
			// }

			// const command = parsedTokens[0].word

			// let possibleVariations = commandData.getCommands().filter((variation) => variation.commandName === command)

			// const cursorTokenBound = parsedTokens.findLastIndex((token) => token.end < position.column - 1)

			// const previousArguments = parsedTokens.slice(
			// 	1,
			// 	cursorTokenBound !== -1 ? cursorTokenBound + 1 : parsedTokens.length
			// )

			// for (let tokenIndex = 0; tokenIndex < previousArguments.length; tokenIndex++) {
			// 	possibleVariations = possibleVariations.filter((variation) => {
			// 		const argument = variation.arguments[tokenIndex]
			// 		const token = previousArguments[tokenIndex]

			// 		if (argument === undefined) return false

			// 		return matchArgument(argument, token)
			// 	})
			// }

			// let cursorTokenIndex =
			// 	parsedTokens.findIndex(
			// 		(token) => token.start <= position.column - 1 && token.end >= position.column - 1
			// 	) - 1

			// if (cursorTokenIndex < 0) cursorTokenIndex = previousArguments.length

			// const cursorToken: Token | undefined = parsedTokens[cursorTokenIndex + 1]

			// const possibleCurrentArguments = possibleVariations
			// 	.map((variation) => variation.arguments[cursorTokenIndex])
			// 	.filter((variation) => variation)

			// if (possibleCurrentArguments.length === 0) return undefined

			// let suggestions: any[] = []

			// for (const argument of possibleCurrentArguments) {
			// 	if (argument.type === 'string') {
			// 		if (argument.additionalData?.values) {
			// 			const wordPart = cursorToken?.word ?? ''

			// 			suggestions = suggestions.concat(
			// 				argument.additionalData.values
			// 					.filter((value: string) => value.startsWith(wordPart))
			// 					.map((value) => {
			// 						return {
			// 							label: value,
			// 							insertText: value.substring(wordPart.length),
			// 							kind: languages.CompletionItemKind.Enum,
			// 							range: new Range(
			// 								position.lineNumber,
			// 								position.column,
			// 								position.lineNumber,
			// 								position.column
			// 							),
			// 						}
			// 					})
			// 			)

			// 			continue
			// 		}

			// 		if (argument.additionalData?.schemaReference) {
			// 			const data = await ProjectManager.currentProject.schemaData.get(
			// 				argument.additionalData.schemaReference.substring(1)
			// 			)

			// 			const wordPart = cursorToken?.word ?? ''

			// 			suggestions = suggestions.concat(
			// 				data.enum
			// 					.filter((value: string) => value.startsWith(wordPart))
			// 					.map((value: string) => {
			// 						return {
			// 							label: value,
			// 							insertText: value.substring(wordPart.length),
			// 							kind: languages.CompletionItemKind.Enum,
			// 							range: new Range(
			// 								position.lineNumber,
			// 								position.column,
			// 								position.lineNumber,
			// 								position.column
			// 							),
			// 						}
			// 					})
			// 			)

			// 			continue
			// 		}
			// 	}

			// 	if (argument.type === 'selector') {
			// 		suggestions = suggestions.concat(
			// 			['@a', '@e', '@p', '@s', '@r', '@initiator'].map((value) => {
			// 				return {
			// 					label: value,
			// 					insertText: cursorToken ? value.substring(cursorToken.word?.length ?? 0) : value,
			// 					kind: languages.CompletionItemKind.Text,
			// 					range: new Range(
			// 						position.lineNumber,
			// 						position.column,
			// 						position.lineNumber,
			// 						position.column
			// 					),
			// 				}
			// 			})
			// 		)

			// 		continue
			// 	}
			// }

			// return {
			// 	suggestions,
			// }
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

function getNextWord(line: string, cursor: number): { word: string; start: number } | null {
	let initialSpaceCount = 0

	while (line[initialSpaceCount] === ' ') initialSpaceCount++

	let spaceIndex = line.substring(cursor + initialSpaceCount).indexOf(' ') + cursor + initialSpaceCount
	if (spaceIndex === -1) spaceIndex = line.length

	if (spaceIndex <= cursor + initialSpaceCount) return null

	return {
		word: line.substring(cursor + initialSpaceCount, spaceIndex),
		start: cursor + initialSpaceCount,
	}
}

// function matchArgument(parameter: Argument, token: Token) {
// 	console.log('Matching', parameter, token)

// 	if (parameter.type === 'string') {
// 		if (parameter.additionalData?.values && !parameter.additionalData.values.includes(token.word ?? ''))
// 			return false

// 		return true
// 	}

// 	if (parameter.type === 'selector') {
// 		if (token.type !== TokenType.Selector) return false

// 		return true
// 	}

// 	console.warn('Unkown parameter type', parameter)

// 	return false
// }
