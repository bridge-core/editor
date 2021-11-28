/**
 * Tokenize a Minecraft command
 * @param command
 * @returns
 */
export function tokenizeCommand(command: string) {
	let curlyBrackets = 0
	let squareBrackets = 0
	let inQuotes = false

	let i = 0
	let wordStart = 0
	let word = ''
	let tokens = []

	while (i < command.length) {
		if (
			(command[i] === '^' && word[0] === '^') ||
			(command[i] === '~' && word[0] === '~')
		) {
			tokens.push({
				startColumn: wordStart,
				endColumn: i,
				word,
			})
			wordStart = i + 1
			word = command[i]
		} else if (command[i] === '"') {
			word += command[i]

			if (inQuotes) {
				tokens.push({
					startColumn: wordStart,
					endColumn: i,
					word,
				})

				wordStart = i + 1
				word = ''
			}
			inQuotes = !inQuotes
		} else if (command[i] === ' ' || command[i] === '\t') {
			if (inQuotes) {
				word += command[i]
				i++
				continue
			}

			if (curlyBrackets === 0 && squareBrackets === 0 && word !== '') {
				tokens.push({
					startColumn: wordStart,
					endColumn: i,
					word,
				})
				wordStart = i + 1
				word = ''
			}
		} else {
			if (command[i] === '{') {
				curlyBrackets++
			} else if (command[i] === '}') {
				curlyBrackets--
			} else if (command[i] === '[') {
				squareBrackets++
			} else if (command[i] === ']') {
				squareBrackets--
			}

			if (command[i].trim() !== '') word += command[i]
		}

		i++
	}

	tokens.push({
		startColumn: wordStart,
		endColumn: i,
		word,
	})

	return { tokens }
}

/**
 * Tokenize target selectors that may appear inside of Minecraft's commands
 * @param targetSelector
 *
 * @example "@a[tag=test]" > [{ startColumn: ..., endColumn: ..., word: "tag" }, { startColumn: ..., endColumn: ..., word: "=" }, { startColumn: ..., endColumn: ..., word: "test" }]
 * @example "@a[tag=test,tag2=test2]" > [{ startColumn: ..., endColumn: ..., word: "tag" }, { startColumn: ..., endColumn: ..., word: "=" }, { startColumn: ..., endColumn: ..., word: "test" }, { startColumn: ..., endColumn: ..., word: "," }, { startColumn: ..., endColumn: ..., word: "tag2" }, { startColumn: ..., endColumn: ..., word: "=" }, { startColumn: ..., endColumn: ..., word: "test2" }]
 */
export function tokenizeTargetSelector(targetSelector: string, wordOffset = 0) {
	let i = 0
	let wordStart = 0
	let word = ''
	let tokens = []

	while (i < targetSelector.length) {
		// TODO: Properly support advanced score selector: "scores={something=..1,something_else=0..2}"

		if (targetSelector[i] === '=') {
			tokens.push({
				startColumn: wordStart + wordOffset,
				endColumn: i + wordOffset,
				word,
			})
			wordStart = i + 1
			word = ''

			if (targetSelector[i + 1] === '!') {
				tokens.push({
					startColumn: i + wordOffset,
					endColumn: wordStart + wordOffset + 1,
					word: '=!',
				})
				i++
				wordStart++
			} else {
				tokens.push({
					startColumn: i + wordOffset,
					endColumn: wordStart + wordOffset,
					word: '=',
				})
			}
		} else if (targetSelector[i] === ',') {
			tokens.push({
				startColumn: wordStart + wordOffset,
				endColumn: i + wordOffset,
				word,
			})
			wordStart = i + 1
			word = ''

			tokens.push({
				startColumn: i + wordOffset,
				endColumn: wordStart + wordOffset,
				word: ',',
			})
		} else {
			if (targetSelector[i].trim() === '' && wordStart === i) wordStart++
			word += targetSelector[i].trim()
		}

		i++
	}

	tokens.push({
		startColumn: wordStart + wordOffset,
		endColumn: i + wordOffset,
		word,
	})

	return { tokens }
}
