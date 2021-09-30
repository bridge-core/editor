export function toUint8Array(n: number) {
	const bytes = new Uint8Array(8)
	for (let i = 0; i < 8; i++) {
		bytes[i] = n & 0xff
		n = n >> 8
	}
	return bytes
}
