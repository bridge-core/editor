import { isNode } from './isNode'
import { toHexString } from './toHexString'

export async function hashString(str: string) {
	// Node doesn't know TextDecoder so we skip it for our tests
	if (isNode()) return `${Math.random().toString(36)}`.slice(2)

	const rawData = new TextEncoder().encode(str)
	const hashedData = await hash(rawData)

	return toHexString(hashedData)
}

export async function hash(data: Uint8Array) {
	return new Uint8Array(await crypto.subtle.digest('sha-1', data))
}
