import { isNode } from './isNode'
import { toHexString } from './toHexString'

// Node doesn't know TextDecoder so we skip it for our tests
const textDecoder = isNode() ? { encode: () => undefined } : new TextEncoder()

export async function hashString(str: string) {
	const rawData = textDecoder.encode(str)
	if (!rawData) return ''

	const hashedData = await hash(rawData)

	return toHexString(hashedData)
}

export async function hash(data: Uint8Array) {
	return new Uint8Array(await crypto.subtle.digest('sha-1', data))
}
