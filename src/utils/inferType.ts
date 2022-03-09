export function inferType(value: string) {
	let transformedValue: string | number | boolean | null = value

	if (typeof value === 'boolean' || value === 'true' || value === 'false')
		transformedValue = typeof value === 'boolean' ? value : value === 'true'
	else if (!Number.isNaN(Number(value))) transformedValue = Number(value)
	else if (value === 'null' || value === null) transformedValue = null

	return transformedValue
}
