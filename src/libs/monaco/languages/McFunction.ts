import { CancellationToken, Position, editor, languages, Range } from 'monaco-editor'
import { colorCodes } from './Language'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { Argument } from '@/libs/data/bedrock/CommandData'

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

			const tokens = tokenize(line)

			console.log('----------------')

			const parsedTokens = parse(tokens)

			console.log(parsedTokens)

			if (tokens.length === 0 || (tokens.length === 1 && tokens[0].end === line.length)) {
				let partialCommand = tokens[0]?.word || ''

				return {
					suggestions: commandData
						.getCommands()
						.map((command) => command.commandName)
						.filter((command, index, commands) => commands.indexOf(command) === index)
						.filter((command) => partialCommand === '' || command.startsWith(partialCommand))
						.map((command) => ({
							label: command,
							insertText: command.substring(partialCommand.length),
							kind: languages.CompletionItemKind.Text,
							//TODO: ocumentation,
							range: new Range(
								position.lineNumber,
								position.column,
								position.lineNumber,
								position.column
							),
						})),
				}
			}

			const command = parsedTokens[0].word

			let possibleVariations = commandData.getCommands().filter((variation) => variation.commandName === command)

			console.log(possibleVariations)

			const cursorTokenBound = parsedTokens.findLastIndex((token) => token.end < position.column - 1)

			const previousArguments = parsedTokens.slice(
				1,
				cursorTokenBound !== -1 ? cursorTokenBound + 1 : parsedTokens.length
			)

			for (let tokenIndex = 0; tokenIndex < previousArguments.length; tokenIndex++) {
				possibleVariations = possibleVariations.filter((variation) => {
					const argument = variation.arguments[tokenIndex]
					const token = previousArguments[tokenIndex]

					if (argument === undefined) return false

					return matchArgument(argument, token)
				})
			}

			console.log(possibleVariations)

			let cursorTokenIndex =
				parsedTokens.findIndex(
					(token) => token.start <= position.column - 1 && token.end >= position.column - 1
				) - 1

			if (cursorTokenIndex < 0) cursorTokenIndex = previousArguments.length

			const cursorToken = parsedTokens[cursorTokenIndex + 1]

			const possibleCurrentArguments = possibleVariations
				.map((variation) => variation.arguments[cursorTokenIndex])
				.filter((variation) => variation)

			console.log(cursorTokenIndex, cursorToken, possibleCurrentArguments)

			if (possibleCurrentArguments.length === 0) return undefined

			let suggestions: any[] = []

			for (const argument of possibleCurrentArguments) {
				if (argument.type === 'string') {
					if (argument.additionalData?.values) {
						suggestions = suggestions.concat(
							argument.additionalData.values.map((value) => {
								return {
									label: value,
									insertText: cursorToken ? value.substring(cursorToken.word?.length ?? 0) : value,
									kind: languages.CompletionItemKind.Text,
									range: new Range(
										position.lineNumber,
										position.column,
										position.lineNumber,
										position.column
									),
								}
							})
						)

						continue
					}
				}

				if (argument.type === 'selector') {
					console.log(
						commandData
							.getSelectorArguments()
							.map((argument) => argument.argumentName)
							.filter((argument, index, argumentArray) => argumentArray.indexOf(argument) === index)
					)

					suggestions = suggestions.concat(
						['@a', '@e', '@p', '@s', '@r', '@initiator'].map((value) => {
							return {
								label: value,
								insertText: cursorToken ? value.substring(cursorToken.word?.length ?? 0) : value,
								kind: languages.CompletionItemKind.Text,
								range: new Range(
									position.lineNumber,
									position.column,
									position.lineNumber,
									position.column
								),
							}
						})
					)

					continue
				}
			}

			return {
				suggestions,
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

function matchArgument(parameter: Argument, token: Token) {
	console.log('Matching', parameter, token)

	if (parameter.type === 'string') {
		if (parameter.additionalData?.values && !parameter.additionalData.values.includes(token.word ?? ''))
			return false

		return true
	}

	if (parameter.type === 'selector') {
		if (token.type !== TokenType.Selector) return false

		return true
	}

	console.warn('Unkown parameter type', parameter)

	return false
}

/*
For command tokenization we'll be using an algorithm I came up with after experimentation in various side projects.
The old command parsing used something similar so I imagine it is not a novel concept but from my limitted'
research I can't find the name for it.

How it works:
The program runs a single for loop untill it encounters the end of the string.

If it encounters a symbol such as '@', '.', or '{', all preceding text is added as a token. Then the symbol
is added as its own token. And all of the text up to and including the token is spliced out.

Spaces also count as a symbol.

After doing basic tokenization, we can run over the tokens and combine adjacent symbols into compound symbols like =!
This also includes joining strings

Finally, if there is ever a text of length 0 trying to be added, it is ignorred.
*/
type Token = {
	start: number
	end: number
	word?: string
	type?: TokenType
	[key: string]: any
}

const symbols = ['!', '.', '{', '}', '[', ']', '=', ':', ' ', '"', ',']

function tokenize(line: string): Token[] {
	const tokens: Token[] = []

	let cursorStart = 0

	for (let cursorIndex = 0; cursorIndex < line.length; cursorIndex++) {
		if (!symbols.includes(line[cursorIndex])) continue

		if (cursorIndex - cursorStart > 0)
			tokens.push({
				start: cursorStart,
				end: cursorIndex,
				word: line.substring(cursorStart, cursorIndex),
			})

		tokens.push({
			start: cursorIndex,
			end: cursorIndex + 1,
			word: line.substring(cursorIndex, cursorIndex + 1),
		})

		cursorStart = cursorIndex + 1
	}

	if (cursorStart < line.length)
		tokens.push({
			start: cursorStart,
			end: line.length,
			word: line.substring(cursorStart, line.length),
		})

	for (let cursorIndex = 0; cursorIndex < tokens.length; cursorIndex++) {
		if (tokens[cursorIndex].word === '"') {
			let endCursorIndex
			for (endCursorIndex = cursorIndex + 1; endCursorIndex < tokens.length; endCursorIndex++) {
				if (tokens[endCursorIndex].word === '"') break
			}

			if (endCursorIndex === tokens.length) endCursorIndex--

			tokens.splice(cursorIndex, endCursorIndex - cursorIndex + 1, {
				start: tokens[cursorIndex].start,
				end: tokens[endCursorIndex].end,
				word: tokens
					.slice(cursorIndex, endCursorIndex + 1)
					.map((token) => token.word)
					.join(''),
			})
		}

		if (
			cursorIndex + 1 < tokens.length &&
			tokens[cursorIndex].word === '@' &&
			!symbols.includes(tokens[cursorIndex + 1].word ?? '')
		) {
			tokens.splice(cursorIndex, 2, {
				start: tokens[cursorIndex].start,
				end: tokens[cursorIndex + 1].end,
				word: '@' + tokens[cursorIndex + 1].word,
			})
		}

		if (
			cursorIndex + 1 < tokens.length &&
			tokens[cursorIndex].word === '=' &&
			tokens[cursorIndex + 1].word === '!'
		) {
			tokens.splice(cursorIndex, 2, {
				start: tokens[cursorIndex].start,
				end: tokens[cursorIndex + 1].end,
				word: '=!',
			})
		}

		if (
			cursorIndex + 1 < tokens.length &&
			tokens[cursorIndex].word === '.' &&
			tokens[cursorIndex + 1].word === '.'
		) {
			tokens.splice(cursorIndex, 2, {
				start: tokens[cursorIndex].start,
				end: tokens[cursorIndex + 1].end,
				word: '..',
			})
		}

		// We don't remove whitespace yet

		// if (tokens[cursorIndex].word === ' ') {
		// 	tokens.splice(cursorIndex, 1)

		// 	cursorIndex--
		// }
	}

	return tokens
}

enum TokenType {
	Number = 'Number',
	Boolean = 'Boolean',
	Symbol = 'Symbol',
	String = 'String',
	Unkown = 'Unknown',
	Whitespace = 'Whitespace',

	Range = 'Range',
	Offset = 'Offset',

	Selector = 'Selector',
	Json = 'Json',
	BlockState = 'Blockstate',
	Parameter = 'Parameter',
	ParameterGroup = 'ParameterGroup',
}

function parse(tokens: Token[]): Token[] {
	if (!ProjectManager.currentProject) return tokens
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return tokens

	for (let index = 0; index < tokens.length; index++) {
		if (tokens[index].word === 'true' || tokens[index].word === 'false') {
			tokens[index].type = TokenType.Boolean
		} else if (['!', '.', '{', '}', '[', ']', '=', ':', '"', ','].includes(tokens[index].word ?? '')) {
			tokens[index].type = TokenType.Symbol
		} else if (/^-?(([0-9]+)|([0-9]+\.)|(\.[0-9]+)|([0-9]+\.[0-9]+))$/.test(tokens[index].word ?? '')) {
			tokens[index].type = TokenType.Number
		} else if (/^(~|\^)((-|\+)?([0-9]+)|([0-9]+\.)|(\.[0-9]+)|([0-9]+\.[0-9]+))?$/.test(tokens[index].word ?? '')) {
			tokens[index].type = TokenType.Offset
		} else if (tokens[index].word?.startsWith('"') && tokens[index].word?.endsWith('"')) {
			tokens[index].type = TokenType.String
		} else if (tokens[index].word === ' ') {
			tokens[index].type = TokenType.Whitespace
		} else {
			tokens[index].type = TokenType.Unkown
		}
	}

	for (let index = 0; index < tokens.length; index++) {
		if (
			index - 1 >= 0 &&
			index + 1 < tokens.length &&
			tokens[index].type === TokenType.Symbol &&
			tokens[index].word === ':' &&
			tokens[index - 1].type === TokenType.Unkown &&
			tokens[index + 1].type === TokenType.Unkown
		) {
			tokens.splice(index - 1, 3, {
				start: tokens[index - 1].start,
				end: tokens[index + 1].end,
				word: tokens[index - 1].word! + tokens[index].word! + tokens[index + 1].word!,
				type: TokenType.Unkown,
			})
		}

		if (
			index - 1 >= 0 &&
			index + 1 < tokens.length &&
			tokens[index].type === TokenType.Unkown &&
			tokens[index].word === '..' &&
			tokens[index - 1].type === TokenType.Number &&
			tokens[index + 1].type === TokenType.Number
		) {
			tokens.splice(index - 1, 3, {
				start: tokens[index - 1].start,
				end: tokens[index + 1].end,
				first: tokens[index - 1],
				second: tokens[index + 1],
				type: TokenType.Range,
				word: tokens[index - 1].word + '..' + tokens[index + 1].word,
			})
		}
	}

	for (let index = 0; index < tokens.length; index++) {
		// TODO: account for dynamic selectors
		if (tokens[index].type === TokenType.Unkown && /^@(a|r|p|e|s|(initiator))$/.test(tokens[index].word!)) {
			if (
				index + 1 < tokens.length &&
				tokens[index + 1].type === TokenType.Symbol &&
				tokens[index + 1].word === '['
			) {
				let openBrackets = 1
				let bracketIndex = index + 2

				for (; openBrackets > 0 && bracketIndex < tokens.length; bracketIndex++) {
					if (tokens[bracketIndex].type === TokenType.Symbol && tokens[bracketIndex].word === '[') {
						openBrackets++
					}

					if (tokens[bracketIndex].type === TokenType.Symbol && tokens[bracketIndex].word === ']') {
						openBrackets--
					}
				}

				if (openBrackets > 0) continue

				tokens.splice(index, bracketIndex - index, {
					start: tokens[index].start,
					end: tokens[bracketIndex - 1].end,
					type: TokenType.Selector,
					base: tokens[index],
					parameters: parseSelectorParameters(tokens.slice(index + 2, bracketIndex - 1)),
				})
			} else {
				tokens[index] = {
					start: tokens[index].start,
					end: tokens[index].end,
					type: TokenType.Selector,
					base: tokens[index],
					parameters: [],
				}
			}
		} else if (tokens[index].type === TokenType.Symbol && tokens[index].word === '[') {
			let openBrackets = 1
			let bracketIndex = index + 2

			for (; openBrackets > 0 && bracketIndex < tokens.length; bracketIndex++) {
				if (tokens[bracketIndex].type === TokenType.Symbol && tokens[bracketIndex].word === '[') {
					openBrackets++
				}

				if (tokens[bracketIndex].type === TokenType.Symbol && tokens[bracketIndex].word === ']') {
					openBrackets--
				}
			}

			if (openBrackets > 0) continue

			tokens.splice(index, bracketIndex - index, {
				start: tokens[index].start,
				end: tokens[bracketIndex - 1].end,
				type: TokenType.BlockState,
				parameters: parseBlockstateParameters(tokens.slice(index + 1, bracketIndex - 1)),
			})
		} else if (tokens[index].type === TokenType.Symbol && tokens[index].word === '{') {
			let openBrackets = 1
			let bracketIndex = index + 2

			for (; openBrackets > 0 && bracketIndex < tokens.length; bracketIndex++) {
				if (tokens[bracketIndex].type === TokenType.Symbol && tokens[bracketIndex].word === '{') {
					openBrackets++
				}

				if (tokens[bracketIndex].type === TokenType.Symbol && tokens[bracketIndex].word === '}') {
					openBrackets--
				}
			}

			if (openBrackets > 0) continue

			tokens.splice(index, bracketIndex - index, {
				start: tokens[index].start,
				end: tokens[bracketIndex - 1].end,
				word: tokens
					.slice(index, bracketIndex)
					.map((token) => token.word)
					.join(''),
				type: TokenType.Json,
			})
		}
	}

	tokens = tokens.filter((token) => token.type !== TokenType.Whitespace)

	return tokens
}

function parseSelectorParameters(tokens: Token[]): Token[] {
	tokens = tokens.filter((token) => token.type !== TokenType.Whitespace)

	for (let index = 0; index < tokens.length; index++) {
		if (
			index + 2 < tokens.length &&
			tokens[index].type === TokenType.Unkown &&
			tokens[index + 1].type === TokenType.Symbol &&
			['=', '=!'].includes(tokens[index + 1].word!) &&
			[TokenType.Number, TokenType.String, TokenType.Range, TokenType.Unkown].includes(tokens[index + 2].type!)
		) {
			tokens.splice(index, 3, {
				start: tokens[index].start,
				end: tokens[index + 2].end,
				type: TokenType.Parameter,
				name: tokens[index],
				operator: tokens[index + 1],
				value: tokens[index + 2],
			})
		}
	}

	for (let index = 0; index < tokens.length; index++) {
		if (tokens[index].type === TokenType.Symbol && tokens[index].word === '{') {
			let openBrackets = 1
			let bracketIndex = index + 2

			for (; openBrackets > 0 && bracketIndex < tokens.length; bracketIndex++) {
				if (tokens[bracketIndex].type === TokenType.Symbol && tokens[bracketIndex].word === '{') {
					openBrackets++
				}

				if (tokens[bracketIndex].type === TokenType.Symbol && tokens[bracketIndex].word === '}') {
					openBrackets--
				}
			}

			if (openBrackets > 0) continue

			tokens.splice(index, bracketIndex - index, {
				start: tokens[index].start,
				end: tokens[bracketIndex - 1].end,
				type: TokenType.ParameterGroup,
				parameters: tokens.slice(index + 1, bracketIndex - 1),
			})
		}
	}

	for (let index = 0; index < tokens.length; index++) {
		if (
			index + 2 < tokens.length &&
			tokens[index].type === TokenType.Unkown &&
			tokens[index + 1].type === TokenType.Symbol &&
			['=', '=!'].includes(tokens[index + 1].word!) &&
			tokens[index + 2].type == TokenType.ParameterGroup
		) {
			tokens.splice(index, 3, {
				start: tokens[index].start,
				end: tokens[index + 2].end,
				type: TokenType.Parameter,
				name: tokens[index],
				operator: tokens[index + 1],
				value: tokens[index + 2],
			})
		}
	}

	return tokens
}

function parseBlockstateParameters(tokens: Token[]): Token[] {
	tokens = tokens.filter((token) => token.type !== TokenType.Whitespace)

	for (let index = 0; index < tokens.length; index++) {
		if (
			index + 2 < tokens.length &&
			tokens[index].type === TokenType.String &&
			tokens[index + 1].type === TokenType.Symbol &&
			tokens[index + 1].word === ':' &&
			[TokenType.Number, TokenType.String, TokenType.Range, TokenType.Unkown].includes(tokens[index + 2].type!)
		) {
			tokens.splice(index, 3, {
				start: tokens[index].start,
				end: tokens[index + 2].end,
				type: TokenType.Parameter,
				name: tokens[index],
				operator: tokens[index + 1],
				value: tokens[index + 2],
			})
		}
	}

	return tokens
}
