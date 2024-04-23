import { CancellationToken, Position, editor, languages, Range, Token } from 'monaco-editor'
import { colorCodes } from './Language'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { BedrockProject } from '@/libs/project/BedrockProject'

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

			const lineUntilCursor = line.slice(0, position.column - 1)

			const tokens = tokenize(line)

			console.log(tokens)

			const parsedTokens = parse(tokens)

			console.log(parsedTokens)

			// if (tokens.length === 0)
			// 	return {
			// 		suggestions: commandData.getCommandNames().map((command) => ({
			// 			label: command,
			// 			insertText,
			// 			documentation,
			// 			kind,
			// 			range: new Range(
			// 				position.lineNumber,
			// 				(lastToken?.startColumn ?? 0) + 1,
			// 				position.lineNumber,
			// 				(lastToken?.endColumn ?? 0) + 1
			// 			),
			// 			insertTextRules,
			// 		})),
			// 	}

			return undefined

			// /**
			//  * Auto-completions for target selector arguments
			//  */
			// const selector = isWithinTargetSelector(line, position.column - 1)
			// if (selector) {
			// 	const selectorStr = line.slice(selector.selectorStart, position.column - 1)
			// 	const { tokens } = tokenizeTargetSelector(selectorStr, selector.selectorStart)
			// 	const lastToken = tokens[tokens.length - 1]

			// 	return {
			// 		suggestions: await commandData.selectorArguments
			// 			.getNextCompletionItems(tokens.map((token) => token.word))
			// 			.then((completionItems) =>
			// 				completionItems.map(({ label, insertText, documentation, kind, insertTextRules }) => ({
			// 					label: label ?? insertText,
			// 					insertText,
			// 					documentation,
			// 					kind,
			// 					range: new Range(
			// 						position.lineNumber,
			// 						(lastToken?.startColumn ?? 0) + 1,
			// 						position.lineNumber,
			// 						(lastToken?.endColumn ?? 0) + 1
			// 					),
			// 					insertTextRules,
			// 				}))
			// 			),
			// 	}
			// }

			// /**
			//  * Normal command auto-completions
			//  */
			// const { tokens } = tokenizeCommand(lineUntilCursor)
			// // Get the last token
			// const lastToken = tokens[tokens.length - 1]

			// const completionItems = await commandData.getNextCompletionItems(tokens.map((token) => token.word))

			// return {
			// 	suggestions: completionItems.map(
			// 		({ label, insertText, documentation, kind, insertTextRules }: any) => ({
			// 			label: label ?? insertText,
			// 			insertText,
			// 			documentation,
			// 			kind,
			// 			range: new Range(
			// 				position.lineNumber,
			// 				(lastToken?.startColumn ?? 0) + 1,
			// 				position.lineNumber,
			// 				(lastToken?.endColumn ?? 0) + 1
			// 			),
			// 			insertTextRules,
			// 		})
			// 	),
			// }
		},
	})

	ProjectManager.updatedCurrentProject.on(() => {
		if (!ProjectManager.currentProject) return
		if (!(ProjectManager.currentProject instanceof BedrockProject)) return

		updateTokensProvider(
			ProjectManager.currentProject.commandData.getCommandNames(),
			ProjectManager.currentProject.commandData.getSelectorArgumentNames()
		)
	})

	updateTokensProvider([], [])

	if (ProjectManager.currentProject && ProjectManager.currentProject instanceof BedrockProject)
		updateTokensProvider(
			ProjectManager.currentProject.commandData.getCommandNames(),
			ProjectManager.currentProject.commandData.getSelectorArgumentNames()
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
	word: string
	type?: TokenType
	[key: string]: any
}

const symbols = ['!', '.', '{', '}', '[', ']', '=', ':', ' ', '"']

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

		if (cursorIndex + 1 < tokens.length && tokens[cursorIndex].word === '@') {
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

	Offset = 'Offset',
	Coordinates = 'Coordinates',

	Selector = 'Selector',
	Json = 'Json',
	Item = 'Item',
	Score = 'Score',
	BlockState = 'Blockstate',
}

function parse(tokens: Token[]): Token[] {
	if (!ProjectManager.currentProject) return tokens
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return tokens

	for (let index = 0; index < tokens.length; index++) {
		if (tokens[index].word === 'true' || tokens[index].word === 'false') {
			tokens[index].type = TokenType.Boolean
		} else if (['!', '.', '{', '}', '[', ']', '=', ':', '"'].includes(tokens[index].word)) {
			tokens[index].type = TokenType.Symbol
		} else if (/^-?(([0-9]+|[0-9]+\.)|(\.[0-9]+)|([0-9]+\.[0-9]+))$/.test(tokens[index].word)) {
			tokens[index].type = TokenType.Number
		}
	}

	for (let index = 0; index < tokens.length; index++) {
		if (tokens[index].type === TokenType.Symbol && (tokens[index].word === '~' || tokens[index].word === '^')) {
			if (index < tokens.length - 1 && tokens[index + 1].type === TokenType.Number) {
			} else if (
				index < tokens.length - 2 &&
				tokens[index + 1].word === '+' &&
				tokens[index + 2].type === TokenType.Number
			) {
			}
		}
	}

	return tokens
}

// enum Context {
// 	Start,
// 	Argument,
// 	Selector,
// 	Json,
// 	BlockState,
// }

// function getContext(tokens: Token[], cursor: number): any {
// 	let cursorTokenIndex = 0

// 	for (; cursorTokenIndex < tokens.length; cursorTokenIndex++) {
// 		if (tokens[cursorTokenIndex].end >= cursor) break
// 	}

// 	let selectorTargetIndex = null

// 	for (let index = 0; index < tokens.length; index++) {
// 		if (tokens[index].start >= cursor) break

// 		if (!tokens[index].word.startsWith('@')) continue

// 		selectorTargetIndex = index

// 		break
// 	}

// 	if (selectorTargetIndex !== null) {
// 	}

// 	// if(!tokens[selectorTargetIndex + 1] || tokens[selectorTargetIndex].word != )

// 	// return false
// }
