export function getTypeOf(val: unknown) {
	if (Array.isArray(val)) return 'array'
	return typeof val
}
