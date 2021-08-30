/**
 * Given an array of file paths that lead to files with the same name, return the first directory that is different for all files
 * @param filePaths
 */

export function getFolderDifference(filePaths: string[]) {
	// Create a matrix of all filePaths (in array form)
	let filePathMatrix = filePaths.map((filePath) =>
		filePath.split('/').reverse()
	)

	// Result array
	const folderDifference: (null | string)[] = filePathMatrix.map(() => null)
	const pointers = filePathMatrix.map(() => 0)

	// Confirm that all files have the same name
	if (
		!filePaths.every(
			(filePath) =>
				filePath.split('/').reverse()[0] ===
				filePaths[0].split('/').reverse()[0]
		)
	) {
		throw new Error('All files must have the same name')
	}

	// Loop through the matrix
	while (pointers.some((pointer, i) => pointer < filePathMatrix[i].length)) {
		// Get the current value
		const currentValue = filePathMatrix.map((row, i) => row[pointers[i]])
		// Check if all values are the same
		const allSame = currentValue.every((value) => value === currentValue[0])
		// If they are not, add the difference to the result
		if (!allSame) {
			folderDifference.forEach((difference, i) => {
				if (difference === null) {
					folderDifference[i] = currentValue[i]
				}
			})
		}

		// Increment the pointers
		pointers.forEach((pointer, index) => {
			if (pointer < filePathMatrix[index].length) {
				pointers[index]++
			}
		})
	}

	// Return the result
	return folderDifference
}
