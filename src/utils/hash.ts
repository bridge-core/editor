import { toHexString } from './toHexString'

export async function hashString(str: string) {
	const rawData = new TextEncoder().encode(str)
	const hashedData = await hash(rawData)

	return toHexString(hashedData)
}

export async function hash(data: Uint8Array) {
	return new Uint8Array(await crypto.subtle.digest('sha-1', data))
}
