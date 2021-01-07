export function toHexString(data: Uint8Array) {
	return Array.from(data)
		.map(b => ('00' + b.toString(16)).slice(-2))
		.join('')
}
