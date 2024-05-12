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
	console.log('Completions triggered')

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
	const basicVariations = variations.filter((variation) => variation.arguments[argumentIndex].type !== 'selector')
	const selectorVariations = variations.filter((variation) => variation.arguments[argumentIndex].type === 'selector')

	const basicCompletions =
		basicVariations.length === 0
			? undefined
			: await getBasicCompletions(line, cursor, tokenCursor, position, basicVariations, argumentIndex)
	const selectorCompletions =
		selectorVariations.length === 0
			? undefined
			: await getSelectorCompletions(line, cursor, tokenCursor, position, selectorVariations, argumentIndex)

	if (basicCompletions === undefined && selectorCompletions === undefined) return undefined

	const completions: any = {
		suggestions: [],
	}

	if (basicCompletions !== undefined)
		completions.suggestions = completions.suggestions.concat(basicCompletions.suggestions)

	if (selectorCompletions !== undefined)
		completions.suggestions = completions.suggestions.concat(selectorCompletions.suggestions)

	return completions
}

async function getBasicCompletions(
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

	return await getArgumentCompletions(line, cursor, tokenCursor, position, variations, argumentIndex + 1)
}

function getBasicSelectorPart(word: string): string {
	if (word[0] !== '@') return ''

	if (word.length === 1) return word[0]

	for (let index = 1; index < word.length; index++) {
		if (!/[a-z]/.test(word[index])) return word.substring(0, index)
	}

	return word
}

async function getSelectorCompletions(
	line: string,
	cursor: number,
	tokenCursor: number,
	position: Position,
	variations: Command[],
	argumentIndex: number
): Promise<{ suggestions: any[] } | undefined> {
	console.log('Selector Completions')

	if (!ProjectManager.currentProject || !(ProjectManager.currentProject instanceof BedrockProject)) return undefined

	const token = getNextSelector(line, tokenCursor)
	if (token === null || cursor <= token.start + token.word.length) {
		let basicSelector = ''

		if (token) basicSelector = getBasicSelectorPart(token.word)

		if (token === null || cursor <= token.start + basicSelector.length) {
			const suggestions: any[] = []

			for (const selector of ['p', 'r', 'a', 'e', 's', 'initiator']) {
				if (token && !('@' + selector).startsWith(token.word)) continue

				suggestions.push({
					label: '@' + selector,
					insertText: '@' + selector,
					kind: languages.CompletionItemKind.Keyword,
					//TODO: ocumentation,
					range: new Range(
						position.lineNumber,
						(token?.start ?? cursor) + 1,
						position.lineNumber,
						(token === null ? cursor : token.start + token.word.length) + 1
					),
				})
			}

			return {
				suggestions,
			}
		}

		tokenCursor = token.start + basicSelector.length

		if (line[tokenCursor] !== '[') return undefined

		tokenCursor++

		if (cursor === token.start + token.word.length && line[tokenCursor] === ']') return undefined

		return await getSelectorArgumentCompletions(line, cursor, tokenCursor, position)
	}

	tokenCursor = token.start + token.word.length

	variations = variations.filter(
		(variation) =>
			matchArgument(token, variation.arguments[argumentIndex]) && variation.arguments.length > argumentIndex + 1
	)

	if (variations.length === 0) return undefined

	return await getArgumentCompletions(line, cursor, tokenCursor, position, variations, argumentIndex + 1)
}

async function getSelectorArgumentCompletions(
	line: string,
	cursor: number,
	tokenCursor: number,
	position: Position
): Promise<{ suggestions: any[] } | undefined> {
	if (!ProjectManager.currentProject || !(ProjectManager.currentProject instanceof BedrockProject)) return undefined

	tokenCursor = skipSpaces(line, tokenCursor)
	let token = getNextSelectorArgumentWord(line, tokenCursor)
	console.log(token)

	if (cursor <= tokenCursor || (token && cursor <= token.start + token.word.length))
		return {
			suggestions: ProjectManager.currentProject.commandData
				.getSelectorArguments()
				.map((argument) => argument.argumentName)
				.map((argument) => ({
					label: argument,
					insertText: argument,
					kind: languages.CompletionItemKind.Keyword,
					//TODO: documentation,
					range: new Range(
						position.lineNumber,
						(token?.start ?? cursor) + 1,
						position.lineNumber,
						(token === null ? cursor : token.start + token.word.length) + 1
					),
				})),
		}

	if (!token) return undefined

	tokenCursor = token.start + token.word.length

	tokenCursor = skipSpaces(line, tokenCursor)
	token = getNextSelectorOperatorWord(line, tokenCursor)
	console.log(token)

	if (cursor <= tokenCursor || token == null) {
		return {
			suggestions: ['=', '=!'].map((operator) => ({
				label: operator,
				insertText: operator,
				kind: languages.CompletionItemKind.Operator,
				//TODO: documentation,
				range: new Range(position.lineNumber, cursor + 1, position.lineNumber, cursor + 1),
			})),
		}
	}

	tokenCursor = token.start + token.word.length

	tokenCursor = skipSpaces(line, tokenCursor)

	token = getNextSelectorValueWord(line, tokenCursor)
	console.log(token)

	if (cursor < tokenCursor || (cursor == tokenCursor && !token))
		return {
			suggestions: [
				{
					label: 'test',
					insertText: 'test',
					kind: languages.CompletionItemKind.Keyword,
					range: new Range(position.lineNumber, cursor + 1, position.lineNumber, cursor + 1),
				},
			],
		}

	if (token && cursor <= token.start + token.word.length)
		return {
			suggestions: [
				{
					label: 'test',
					insertText: 'test',
					kind: languages.CompletionItemKind.Keyword,
					range: new Range(
						position.lineNumber,
						token.start + 1,
						position.lineNumber,
						token.start + token.word.length + 1
					),
				},
			],
		}

	if (token === null) return undefined

	tokenCursor = token.start + token.word.length

	tokenCursor = skipSpaces(line, tokenCursor)
	if (line[tokenCursor] !== ',') return undefined

	tokenCursor++

	return await getSelectorArgumentCompletions(line, cursor, tokenCursor, position)
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

function skipSpaces(line: string, cursor: number): number {
	let startCharacter = cursor

	while (line[startCharacter] === ' ') startCharacter++

	return startCharacter
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

function getNextSelector(line: string, cursor: number): Token | null {
	let startCharacter = cursor

	while (line[startCharacter] === ' ') startCharacter++

	if (line[startCharacter] !== '@') return null

	let endCharacter = startCharacter + 2

	while (/^[a-z]+$/.test(line.slice(startCharacter + 1, endCharacter)) && endCharacter <= line.length) {
		endCharacter++
	}

	endCharacter--

	if (endCharacter === startCharacter + 1)
		return {
			word: '@',
			start: startCharacter,
		}

	if (line[endCharacter] !== '[')
		return {
			word: line.substring(startCharacter, endCharacter),
			start: startCharacter,
		}

	endCharacter++

	let openBracketCount = 1

	for (; endCharacter < line.length; endCharacter++) {
		if (line[endCharacter] === '[') {
			openBracketCount++
		} else if (line[endCharacter] === ']') {
			openBracketCount--

			if (openBracketCount === 0) {
				endCharacter++

				break
			}
		}
	}

	return {
		word: line.substring(startCharacter, endCharacter),
		start: startCharacter,
	}
}

function getNextSelectorArgumentWord(line: string, cursor: number): Token | null {
	let endCharacter = cursor + 1

	while (/^[a-z]+$/.test(line.slice(cursor, endCharacter)) && endCharacter <= line.length) {
		endCharacter++
	}

	endCharacter--

	if (endCharacter === cursor) return null

	return {
		word: line.substring(cursor, endCharacter),
		start: cursor,
	}
}

function getNextSelectorOperatorWord(line: string, cursor: number): Token | null {
	if (line[cursor] + line[cursor + 1] === '=!') {
		return {
			word: '=!',
			start: cursor,
		}
	}

	if (line[cursor] === '=') {
		return {
			word: '=',
			start: cursor,
		}
	}

	return null
}

function getNextSelectorValueWord(line: string, cursor: number): Token | null {
	const match = line.substring(cursor).match(/^[a-z]+/)

	if (match === null) return null

	return {
		word: line.substring(cursor, cursor + match[0].length),
		start: cursor,
	}
}
