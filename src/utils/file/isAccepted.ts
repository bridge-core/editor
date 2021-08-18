/**
 * Returns whether a file is accepted by the given "accept" filter
 *
 * @param file The file to check
 * @param accept The accept filter (see HTML file input)
 */
export function isFileAccepted(file: File, accept?: string) {
	if (!accept) {
		return true
	}

	const acceptedFiles = accept.split(',')
	const fileName = file.name || ''
	const mimeType = file.type || ''
	const baseMimeType = mimeType.replace(/\/.*$/, '')
	console.log(acceptedFiles, mimeType)

	return acceptedFiles.some((type) => {
		const validType = type.trim()
		if (validType.charAt(0) === '.') {
			return fileName.toLowerCase().endsWith(validType.toLowerCase())
		} else if (/\/\*$/.test(validType)) {
			// This is something like a image/* mime type
			return baseMimeType === validType.replace(/\/.*$/, '')
		}
		return mimeType === validType
	})
}
