export function asUsableKey(key: Uint8Array) {
	return key.slice(0, key.length - 8)
}
