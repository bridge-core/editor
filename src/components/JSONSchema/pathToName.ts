export function pathToName(path: string): string {
	const parts = path.replaceAll('#', '').replaceAll('_', '/').split(/\\|\//g)

	// Capitalize the first letter of each part
	const capitalized = parts.map(
		(part) => part.charAt(0).toUpperCase() + part.slice(1)
	)

	// Remove file extensions from parts (they can be anywhere because of the "#/" $ref hash syntax)
	const withoutExts = capitalized.map((part) => part.split('.')[0])

	return withoutExts.join('')
}
