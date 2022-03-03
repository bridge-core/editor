export function asUsableKey(key: Uint8Array) {
	if (key.length === 0) return key

	return key.slice(0, key.length - 8)
}
