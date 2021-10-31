export function getKeyType(key: Uint8Array) {
	return key.slice(key.length - 8, key.length - 7)[0]
}
