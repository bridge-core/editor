/**
 * Convert the signed integer n to an Uint8Array representing a little-endian, 32 bit signed integer
 * @param n
 * @returns Uint8Array[4]
 */
export function toUint8Array(n: number) {
	const buffer = new ArrayBuffer(4)
	const view = new DataView(buffer)
	view.setInt32(0, n, true)
	return new Uint8Array(buffer)
}
