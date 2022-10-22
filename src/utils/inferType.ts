const numberRegExp = /^\d+(\.\d+)?$/

export function inferType(value: string) {
	let transformedValue: string | number | boolean | null = value

	if (typeof value === 'boolean' || value === 'true' || value === 'false')
		transformedValue = typeof value === 'boolean' ? value : value === 'true'
	else if (numberRegExp.test(value)) transformedValue = Number(value)
	else if (value === 'null' || value === null) transformedValue = null

	numberRegExp.lastIndex = 0

	return transformedValue
}
