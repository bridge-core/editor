export function tokenizeCommand(command: string) {
	let curlyBrackets = 0
	let squareBrackets = 0

	let i = 0
	let wordStart = 0
	let word = ''
	let tokens = []

	while (i < command.length) {
		if (command[i] === '^' || command[i] === '~') {
			if (word[0] === '~' || word[0] === '^') {
				tokens.push({
					startColumn: wordStart,
					endColumn: i,
					word,
				})
				wordStart = i + 1
				word = command[i]
				break
			}
		} else if (command[i] === ' ' || command[i] === '\t') {
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
