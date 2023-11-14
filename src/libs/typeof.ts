export function getTypeOf(val: unknown) {
	if (Array.isArray(val)) return 'array'
	else if (val === null) return 'null'
	else if (typeof val === 'number') {
		if (Number.isInteger(val)) return 'integer'
		else return 'number'
	}

	return typeof val
}
