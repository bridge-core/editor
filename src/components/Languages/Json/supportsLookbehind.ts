/**
 * A function that tests for RegExp lookahead support.
 */
export function supportsLookbehind(): boolean {
	try {
		const regExp = new RegExp('(?<!\\\\)"')
		return '\\"'.match(regExp) === null
	} catch (err) {
		return false
	}
}
