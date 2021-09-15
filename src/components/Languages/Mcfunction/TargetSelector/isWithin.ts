/**
 * Returns whether the user's cursor is currently within a Minecraft target selector
 *
 * @param line
 * @param postion
 *
 * @example line = "say @e[name=test]", position = 10 > true
 *
 * @returns { selectorStart, selectorEnd } or false if none
 */
export function isWithinTargetSelector(line: string, index: number) {
	const prevUnclosed = previousUnclosedBracket(line, index - 1)

	if (prevUnclosed === -1) {
		return false
	}

	// Test whether characters before prevUnclosed bracket start with an @
	let beforeBracket = ''
	let i = prevUnclosed - 1
	while (i >= 0 && line[i] !== ' ') {
		beforeBracket = line[i] + beforeBracket
		i--
	}

	return beforeBracket.startsWith('@')
		? {
				selectorStart: prevUnclosed + 1,
				selectorEnd: nextClosingBracket(line, index),
		  }
		: false
}

/**
 * Returns the index of the previous unclosed square bracket, -1 if none
 * @param line
 * @param index
 */
function previousUnclosedBracket(line: string, index: number) {
	for (let i = index; i >= 0; i--) {
		if (line[i] == '[') {
			return i
		} else if (line[i] === ']') {
			return -1
		}
	}

	return -1
}

function nextClosingBracket(line: string, index: number) {
	for (let i = index; i < line.length; i++) {
		if (line[i] == ']') {
			return i
		}
	}

	return -1
}
