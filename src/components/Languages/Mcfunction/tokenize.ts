export function tokenizeCommand(command: string) {
	let curlyBrackets = 0
	let squareBrackets = 0

	let i = 0
	let wordStart = 0
	let word = ''
	let tokens = []
	while (i < command.length) {
		switch (command[i]) {
			// TODO: Validate patterns like "][" correctly (bracket count may not be below 0)
			// TODO: Support strings

			// Support patterns like "~~~" or "^^^" without whitespace as token separators
			case '^':
			case '~': {
				if (word[0] === '~') {
					tokens.push({
						startColumn: wordStart,
						endColumn: i,
						word,
					})
					wordStart = i + 1
					word = command[i]
					break
				}
			}

			case '\t':
			case ' ': {
				if (
					curlyBrackets === 0 &&
					squareBrackets === 0 &&
					word !== ''
				) {
					tokens.push({
						startColumn: wordStart,
						endColumn: i,
						word,
					})
					wordStart = i + 1
					word = ''
					break
				}
			}

			case '{':
				curlyBrackets++
			case '}':
				curlyBrackets--
			case '[':
				squareBrackets++
			case ']':
				squareBrackets--

			default:
				if (command[i].trim() !== '') word += command[i]
				break
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
