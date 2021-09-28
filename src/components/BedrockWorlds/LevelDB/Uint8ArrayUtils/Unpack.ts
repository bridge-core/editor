/**
 * Given an Uint8Array, return an array with only 0 and 1 values.
 */
export function unpackBits(bytes: Uint8Array): Uint8Array {
	const result = new Uint8Array(8 * bytes.length)

	for (let i = 0; i < bytes.length; i++) {
		const byte = bytes[i]
		for (let j = 0; j < 8; j++) {
			result[(i + 1) * 8 - (j + 1)] = (byte >> j) & 1
		}
	}

	return result
}

/**
 * Given an array of 0 and 1 values, return an Uint8Array where bitsPerNumber bits are packed into each byte.
 */
export function packBits(bits: Uint8Array, bitsPerNumber: number) {
	const bytes = new Uint8Array(Math.ceil(bits.length / bitsPerNumber))

	for (let i = 0; i < bytes.length; i++) {
		let byte = 0
		for (let j = 0; j < bitsPerNumber; j++) {
			byte |= bits[i * bitsPerNumber + j] << j
		}
		bytes[i] = byte
	}

	return bytes
}

export function unpackStruct(bytes: Uint8Array) {
	return bytes.length < 4 ? 0 : new DataView(bytes.buffer).getUint32(0, true)
}

const arr = new Uint8Array([0, 1, 2, 3, 4])

console.log(arr, unpackBits(arr), packBits(unpackBits(arr), 4))
