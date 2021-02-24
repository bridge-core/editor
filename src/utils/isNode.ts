export const isNode = () => {
	try {
		return typeof process !== 'undefined' && process.release.name === 'node'
	} catch {
		return false
	}
}
