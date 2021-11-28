/**
 * Given a string, cast it to the value of a type it represents
 *
 * @example
 * castType('true') -> true
 * castType('1') -> 1
 * castType('Example') -> 'Example'
 */
export function castType(value: string): any {
	if (value === 'true') {
		return true
	} else if (value === 'false') {
		return false
	} else if (value === 'null') {
		return null
	} else if (value === 'undefined') {
		return undefined
	} else if (isNumeric(value)) {
		return Number(value)
	} else if (typeof value === 'string') {
		if (value.startsWith('"') && value.endsWith('"'))
			return value.slice(1, -1)
		return value
	} else {
		return value
	}
}

/**
 * Returns whether a string is numeric
 */
function isNumeric(value: string): boolean {
	return !isNaN(Number(value))
}
