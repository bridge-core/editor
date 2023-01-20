/**
 * Return the edit distance between two strings.
 */
export function editDistance(a: string, b: string): number {
	if (a.length === 0) return b.length
	if (b.length === 0) return a.length

	const matrix = new Array(b.length + 1)
	// Increment along the first column of each row
	for (let i = 0; i <= b.length; i++) {
		matrix[i] = new Array(a.length + 1)
		matrix[i][0] = i
	}

	// Increment each column in the first row
	for (let i = 0; i <= a.length; i++) {
		matrix[0][i] = i
	}

	// Fill matrix
	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1]
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1, // substitution
					matrix[i][j - 1] + 1, // insertion
					matrix[i - 1][j] + 1 // deletion
				)
			}
		}
	}

	return matrix[b.length][a.length]
}
