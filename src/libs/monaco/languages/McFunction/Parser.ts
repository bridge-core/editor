import { BedrockProject } from '@/libs/project/BedrockProject'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Argument, Command, SelectorArgument } from '@/libs/data/bedrock/CommandData'

export interface Token {
	word: string
	start: number
}

export interface Context {
	kind: string
	token: Token | undefined
}

export async function getContext(line: string, cursor: number, tokenCursor: number = 0): Promise<Context[]> {
	return getCommandContext(line, cursor, tokenCursor)
}

async function getCommandContext(line: string, cursor: number, tokenCursor: number): Promise<Context[]> {
	if (!(ProjectManager.currentProject instanceof BedrockProject))
		throw new Error('The current project must be a bedrock project!')

	const commandData = ProjectManager.currentProject.commandData

	tokenCursor = skipSpaces(line, tokenCursor)
	const token = getNextWord(line, tokenCursor)

	if (!token || cursor <= token.start + token.word.length)
		return [
			{
				kind: 'command',
				token: token ?? undefined,
			},
		]

	tokenCursor = token.start + token.word.length

	const customTypes = commandData.getCustomTypes()

	let possibleVariations: Command[] = commandData
		.getCommands()
		.filter((variation) => variation.commandName === token.word)
		.map((variation) => ({
			commandName: variation.commandName,
			description: variation.description,
			arguments: variation.arguments.flatMap((argument) => {
				if (argument.type.startsWith('$') && customTypes[argument.type.substring(1)]) {
					return customTypes[argument.type.substring(1)].map(
						(customType) =>
							({
								...argument,
								...customType,
							} as Argument)
					)
				}

				return [argument]
			}),
			original: JSON.parse(JSON.stringify(variation)),
		}))

	return await getArgumentContext(line, cursor, tokenCursor, possibleVariations, 0, token.word)
}

async function getArgumentContext(
	line: string,
	cursor: number,
	tokenCursor: number,
	variations: Command[],
	argumentIndex: number,
	command: string
): Promise<Context[]> {
	if (!(ProjectManager.currentProject instanceof BedrockProject))
		throw new Error('The current project must be a bedrock project!')

	const commandData = ProjectManager.currentProject.commandData

	variations = variations.flatMap((variation) => {
		if (variation.arguments[argumentIndex]?.allowMultiple) {
			const modifiedArguments = JSON.parse(JSON.stringify(variation.arguments))
			modifiedArguments.splice(argumentIndex, 0, JSON.parse(JSON.stringify(variation.arguments[argumentIndex])))

			return [
				variation,
				{
					...variation,
					arguments: modifiedArguments,
				},
			]
		}

		return [variation]
	})

	variations = variations.flatMap((variation) => {
		if (variation.arguments[argumentIndex]?.type === 'subcommand') {
			return commandData
				.getSubcommands()
				.find((commandData) => commandData.commandName === command)!
				.commands.map((subcommand) => {
					const args = JSON.parse(JSON.stringify(variation.arguments))
					args.splice(
						argumentIndex,
						1,
						{
							argumentName: 'subcommand',
							type: 'string',
							additionalData: {
								values: [subcommand.commandName],
							},
						},
						...subcommand.arguments
					)

					return {
						...variation,
						arguments: args,
					}
				})
		}

		return [variation]
	})

	const basicVariations = variations.filter((variation) => variation.arguments[argumentIndex].type !== 'selector')
	const selectorVariations = variations.filter((variation) => variation.arguments[argumentIndex].type === 'selector')
	const commandVariations = variations.filter((variation) => variation.arguments[argumentIndex].type === 'command')
	const blockStateVariations = variations.filter(
		(variation) => variation.arguments[argumentIndex].type === 'blockState'
	)
	const jsonDataVariations = variations.filter((variation) => variation.arguments[argumentIndex].type === 'jsonData')

	const basicCompletions =
		basicVariations.length === 0
			? undefined
			: await getBasicContext(line, cursor, tokenCursor, basicVariations, argumentIndex, command)

	const selectorCompletions =
		selectorVariations.length === 0
			? undefined
			: await getSelectorContext(line, cursor, tokenCursor, selectorVariations, argumentIndex, command)

	const commandCompletions =
		commandVariations.length === 0 ? undefined : await getCommandContext(line, cursor, tokenCursor)

	const blockStateCompletions =
		blockStateVariations.length === 0
			? undefined
			: await getBlockStateContext(line, cursor, tokenCursor, blockStateVariations, argumentIndex, command)

	const jsonDataCompletions =
		jsonDataVariations.length === 0
			? undefined
			: await getJsonDataContext(line, cursor, tokenCursor, jsonDataVariations, argumentIndex, command)
	if (
		basicCompletions === undefined &&
		selectorCompletions === undefined &&
		commandCompletions === undefined &&
		blockStateCompletions === undefined &&
		jsonDataCompletions === undefined
	)
		return [
			{
				kind: 'end',
				token: undefined,
			},
		]

	let completions: Context[] = []

	if (basicCompletions !== undefined) completions = completions.concat(basicCompletions)

	if (selectorCompletions !== undefined) completions = completions.concat(selectorCompletions)

	if (commandCompletions !== undefined) completions = completions.concat(commandCompletions)

	if (blockStateCompletions !== undefined) completions = completions.concat(blockStateCompletions)

	if (jsonDataCompletions !== undefined) completions = completions.concat(jsonDataCompletions)

	completions = completions.filter(
		(suggestion: any, index: any, suggestions: any) =>
			suggestions.findIndex((otherSuggestion: any) => suggestion.label === otherSuggestion.label) === index
	)

	return completions
}

export interface ArgumentContext extends Context {
	variations: Command[]
	command: string
	argumentIndex: number
}

async function getBasicContext(
	line: string,
	cursor: number,
	tokenCursor: number,
	variations: Command[],
	argumentIndex: number,
	command: string
): Promise<Context[]> {
	if (!(ProjectManager.currentProject instanceof BedrockProject))
		throw new Error('The current project must be a bedrock project!')

	tokenCursor = skipSpaces(line, tokenCursor)
	const token = getNextWord(line, tokenCursor)

	if (!token || cursor <= token.start + token.word.length)
		return [
			{
				kind: 'argument',
				token: token ?? undefined,
				variations,
				command,
				argumentIndex,
			} as ArgumentContext,
		]

	tokenCursor = token.start + token.word.length

	variations = variations.filter(
		(variation) =>
			matchArgument(token, variation.arguments[argumentIndex]) && variation.arguments.length > argumentIndex + 1
	)

	if (variations.length === 0)
		return [
			{
				kind: 'end',
				token: undefined,
			},
		]

	return await getArgumentContext(line, cursor, tokenCursor, variations, argumentIndex + 1, command)
}

async function getSelectorContext(
	line: string,
	cursor: number,
	tokenCursor: number,
	variations: Command[],
	argumentIndex: number,
	command: string
): Promise<Context[]> {
	if (!(ProjectManager.currentProject instanceof BedrockProject))
		throw new Error('The current project must be a bedrock project!')

	tokenCursor = skipSpaces(line, tokenCursor)
	const token = getNextSelector(line, tokenCursor)

	if (!token || cursor <= tokenCursor)
		return [
			{
				kind: 'argument',
				token: undefined,
				variations,
				command,
				argumentIndex,
			} as ArgumentContext,
		]

	if (cursor <= token.start + token.word.length) {
		let basicSelector = getBasicSelectorPart(token.word)

		if (cursor <= token.start + basicSelector.length)
			return [
				{
					kind: 'argument',
					token: token,
					variations,
					command,
					argumentIndex,
				} as ArgumentContext,
			]

		tokenCursor = token.start + basicSelector.length

		if (line[tokenCursor] !== '[')
			return [
				{
					kind: 'end',
					token: undefined,
				},
			]

		tokenCursor++

		if (cursor === token.start + token.word.length && line[tokenCursor] === ']')
			return [
				{
					kind: 'end',
					token: undefined,
				},
			]

		return await getSelectorArgumentContext(line, cursor, tokenCursor)
	}

	tokenCursor = token.start + token.word.length

	variations = variations.filter(
		(variation) =>
			matchArgument(token, variation.arguments[argumentIndex]) && variation.arguments.length > argumentIndex + 1
	)

	if (variations.length === 0)
		return [
			{
				kind: 'end',
				token: undefined,
			},
		]

	return await getArgumentContext(line, cursor, tokenCursor, variations, argumentIndex + 1, command)
}

export interface SelectorContext extends Context {
	previousArguments: string[]
}

export interface SelectorValueContext extends SelectorContext {
	argument: SelectorArgument
}

async function getSelectorArgumentContext(
	line: string,
	cursor: number,
	tokenCursor: number,
	previousArguments: string[] = []
): Promise<Context[]> {
	if (!(ProjectManager.currentProject instanceof BedrockProject))
		throw new Error('The current project must be a bedrock project!')

	tokenCursor = skipSpaces(line, tokenCursor)
	let token = getNextSelectorArgumentWord(line, tokenCursor)

	if (!token || cursor <= token.start + token.word.length) {
		return [
			{
				kind: 'selectorArgument',
				token: token ?? undefined,
				previousArguments,
			} as SelectorContext,
		]
	}

	let selectorArgument = token.word

	const argumentData = ProjectManager.currentProject.commandData
		.getSelectorArguments()
		.find((data) => data.argumentName === token!.word)

	tokenCursor = token.start + token.word.length

	tokenCursor = skipSpaces(line, tokenCursor)
	token = getNextSelectorOperatorWord(line, tokenCursor)

	if (!token || cursor <= tokenCursor) {
		return [
			{
				kind: 'selectorOperator',
				token: token ?? undefined,
				argument: argumentData,
				previousArguments,
			} as SelectorValueContext,
		]
	}

	tokenCursor = token.start + token.word.length

	tokenCursor = skipSpaces(line, tokenCursor)
	token = getNextSelectorValueWord(line, tokenCursor)

	if (!token || cursor < tokenCursor)
		return [
			{
				kind: 'selectorValue',
				token: token ?? undefined,
				argument: argumentData,
				previousArguments,
			} as SelectorValueContext,
		]

	tokenCursor = token.start + token.word.length

	tokenCursor = skipSpaces(line, tokenCursor)
	if (line[tokenCursor] !== ',')
		return [
			{
				kind: 'end',
				token: undefined,
			},
		]

	tokenCursor++

	return await getSelectorArgumentContext(line, cursor, tokenCursor, [...previousArguments, selectorArgument])
}

async function getBlockStateContext(
	line: string,
	cursor: number,
	tokenCursor: number,
	variations: Command[],
	argumentIndex: number,
	command: string
): Promise<Context[]> {
	if (!(ProjectManager.currentProject instanceof BedrockProject))
		throw new Error('The current project must be a bedrock project!')

	tokenCursor = skipSpaces(line, tokenCursor)
	const token = getNextBlockState(line, tokenCursor)

	if (!token || cursor <= token.start + token.word.length)
		return [
			{
				kind: 'blockState',
				token: token ?? undefined,
			},
		]

	tokenCursor = token.start + token.word.length

	variations = variations.filter(
		(variation) =>
			matchArgument(token, variation.arguments[argumentIndex]) && variation.arguments.length > argumentIndex + 1
	)

	if (variations.length === 0)
		return [
			{
				kind: 'end',
				token: undefined,
			},
		]

	return await getArgumentContext(line, cursor, tokenCursor, variations, argumentIndex + 1, command)
}

async function getJsonDataContext(
	line: string,
	cursor: number,
	tokenCursor: number,
	variations: Command[],
	argumentIndex: number,
	command: string
): Promise<Context[]> {
	if (!(ProjectManager.currentProject instanceof BedrockProject))
		throw new Error('The current project must be a bedrock project!')

	tokenCursor = skipSpaces(line, tokenCursor)
	const token = getNextJsonData(line, tokenCursor)

	if (!token) {
		return [
			{
				kind: 'jsonData',
				token: token ?? undefined,
			},
		]
	}

	return await getBasicContext(line, cursor, tokenCursor, variations, argumentIndex + 1, command)
}

function matchArgument(argument: Token, type: any): boolean {
	if (type === undefined) return false

	if (type.type === 'string') {
		if (type.additionalData?.values && !type.additionalData.values.includes(argument.word)) return false

		return true
	}

	if (type.type === 'boolean' && /^(true|false)$/) return true

	if (type.type === 'selector' && /^@(a|e|r|s|p|(initiator))/.test(argument.word)) return true

	if (type.type === 'coordinate' && /^[~^]?(-?(([0-9]*\.[0-9]+)|[0-9]+))?$/.test(argument.word)) return true

	if (type.type === 'number' && /^-?(([0-9]*\.[0-9]+)|[0-9]+)$/.test(argument.word)) return true

	if (type.type === 'blockState' && /^(\[|[0-9]+)/.test(argument.word)) return true

	if (type.type === 'jsonData' && /^(\{|\[)/.test(argument.word)) return true

	console.warn('Failed to match', argument, type)

	return false
}

function skipSpaces(line: string, cursor: number): number {
	let startCharacter = cursor

	while (line[startCharacter] === ' ') startCharacter++

	return startCharacter
}

function getNextWord(line: string, cursor: number): Token | null {
	if (line[cursor] === '{') {
		let endCharacter = cursor + 1

		let openBracketCount = 1
		let withinString = false

		for (; endCharacter < line.length; endCharacter++) {
			if (line[endCharacter] === '"') {
				if (!withinString) {
					withinString = true
				} else if (line[endCharacter - 1] !== '\\') {
					withinString = false
				}
			}

			if (withinString) continue

			if (line[endCharacter] === '{') {
				openBracketCount++
			} else if (line[endCharacter] === '}') {
				openBracketCount--

				if (openBracketCount === 0) {
					endCharacter++

					break
				}
			}
		}

		return {
			word: line.substring(cursor, endCharacter),
			start: cursor,
		}
	}

	if (line[cursor] === '"') {
		let closingIndex = -1

		for (let index = cursor + 1; index < line.length; index++) {
			if (line[index] !== '"') continue

			if (line[index - 1] === '\\') continue

			closingIndex = index + 1
		}

		if (closingIndex === -1) closingIndex = line.length

		return {
			word: line.substring(cursor, closingIndex),
			start: cursor,
		}
	}

	let spaceIndex = line.substring(cursor).indexOf(' ') + cursor
	if (spaceIndex === cursor - 1) spaceIndex = line.length

	if (spaceIndex <= cursor) return null

	return {
		word: line.substring(cursor, spaceIndex),
		start: cursor,
	}
}

function getNextSelector(line: string, cursor: number): Token | null {
	if (line[cursor] !== '@') return null

	let endCharacter = cursor + 2

	while (/^[a-z]+$/.test(line.slice(cursor + 1, endCharacter)) && endCharacter <= line.length) {
		endCharacter++
	}

	endCharacter--

	if (endCharacter === cursor + 1)
		return {
			word: '@',
			start: cursor,
		}

	if (line[endCharacter] !== '[')
		return {
			word: line.substring(cursor, endCharacter),
			start: cursor,
		}

	endCharacter++

	let openBracketCount = 1
	let withinString = false

	for (; endCharacter < line.length; endCharacter++) {
		if (line[endCharacter] === '"') {
			if (!withinString) {
				withinString = true
			} else if (line[endCharacter - 1] !== '\\') {
				withinString = false
			}
		}

		if (withinString) continue

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
		word: line.substring(cursor, endCharacter),
		start: cursor,
	}
}

function getBasicSelectorPart(word: string): string {
	if (word[0] !== '@') return ''

	if (word.length === 1) return word[0]

	for (let index = 1; index < word.length; index++) {
		if (!/[a-z]/.test(word[index])) return word.substring(0, index)
	}

	return word
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
	if (line[cursor] === '{') {
		let endCharacter = cursor + 1

		let openBracketCount = 1
		let withinString = false

		for (; endCharacter < line.length; endCharacter++) {
			if (line[endCharacter] === '"') {
				if (!withinString) {
					withinString = true
				} else if (line[endCharacter - 1] !== '\\') {
					withinString = false
				}
			}

			if (withinString) continue

			if (line[endCharacter] === '{') {
				openBracketCount++
			} else if (line[endCharacter] === '}') {
				openBracketCount--

				if (openBracketCount === 0) {
					endCharacter++

					break
				}
			}
		}

		return {
			word: line.substring(cursor, endCharacter),
			start: cursor,
		}
	}

	if (line[cursor] === '"') {
		let closingIndex = -1

		for (let index = cursor + 1; index < line.length; index++) {
			if (line[index] !== '"') continue

			if (line[index - 1] === '\\') continue

			closingIndex = index + 1
		}

		if (closingIndex === -1) closingIndex = line.length

		return {
			word: line.substring(cursor, closingIndex),
			start: cursor,
		}
	}

	const match = line.substring(cursor).match(/^[a-z_:A-Z0-9.]+/)

	if (match === null) return null

	return {
		word: line.substring(cursor, cursor + match[0].length),
		start: cursor,
	}
}

function getNextBlockState(line: string, cursor: number): Token | null {
	if (line[cursor] !== '[') {
		let endCharacter = cursor + 1

		while (/^[0-9]+$/.test(line.slice(cursor, endCharacter)) && endCharacter <= line.length) {
			endCharacter++
		}

		endCharacter--

		if (endCharacter === cursor) return null

		return {
			word: line.substring(cursor, endCharacter),
			start: cursor,
		}
	}

	let endCharacter = cursor + 1

	let openBracketCount = 1
	let withinString = false

	for (; endCharacter < line.length; endCharacter++) {
		if (line[endCharacter] === '"') {
			if (!withinString) {
				withinString = true
			} else if (line[endCharacter - 1] !== '\\') {
				withinString = false
			}
		}

		if (withinString) continue

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
		word: line.substring(cursor, endCharacter),
		start: cursor,
	}
}

function getNextJsonData(line: string, cursor: number): Token | null {
	if (line[cursor] === '{') {
		let endCharacter = cursor + 1

		let openBracketCount = 1
		let withinString = false

		for (; endCharacter < line.length; endCharacter++) {
			if (line[endCharacter] === '"') {
				if (!withinString) {
					withinString = true
				} else if (line[endCharacter - 1] !== '\\') {
					withinString = false
				}
			}

			if (withinString) continue

			if (line[endCharacter] === '{') {
				openBracketCount++
			} else if (line[endCharacter] === '}') {
				openBracketCount--

				if (openBracketCount === 0) {
					endCharacter++

					break
				}
			}
		}
		return {
			word: line.substring(cursor, endCharacter),
			start: cursor,
		}
	}
	return null
}
