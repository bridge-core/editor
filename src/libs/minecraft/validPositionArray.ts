export function isValidPositionArray(
	array: unknown
): array is [number, number, number] {
	return (
		Array.isArray(array) &&
		array.length === 3 &&
		typeof array[0] === 'number' &&
		typeof array[1] === 'number' &&
		typeof array[2] === 'number'
	)
}
