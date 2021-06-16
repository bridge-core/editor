export function tokenizeCommand(command: string) {
	let curlyBrackets = 0
	let squareBrackets = 0

	let i = 0
	let word = ''
	let tokens = []
	while (i < command.length) {
		switch (command[i]) {
			// TODO: Validate patterns like "][" correctly (bracket count may not be below 0)
			// TODO: Support strings

			case '{':
				curlyBrackets++
				break
			case '}':
				curlyBrackets--
				break
			case '[':
				squareBrackets++
				break
			case ']':
				squareBrackets--
				break

			case '\t':
			case ' ': {
				if (curlyBrackets === 0 && squareBrackets === 0) {
					if (word === '') {
						tokens.push({ index: i, word })
						word = ''
						break
					}
				}
			}

			default:
				word += command[i]
				break
		}
		i++
	}

	return { tokens }
}
