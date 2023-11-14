import { editDistance } from './editDistance'

/**
 * Return the closest match to a string in a list of strings.
 */
export function closestMatch(
	str: string,
	strings: string[],
	threshold = 0.3
): string | null {
	const distances = strings.map((s) => editDistance(str, s))
	const min = Math.min(...distances)
	const index = distances.findIndex((d) => d === min)
	if (min / str.length > threshold) return null

	return strings[index]
}
