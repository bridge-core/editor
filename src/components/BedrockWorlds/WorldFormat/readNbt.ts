import { protoLE } from 'prismarine-nbt'
import { Buffer } from 'buffer'

export function readNbt(nbtData: Uint8Array, offset = 0) {
	const { data, metadata } = protoLE.parsePacketBuffer(
		'nbt',
		Buffer.from(nbtData),
		offset
	)

	return {
		data,
		size: metadata.size,
	}
}

export function readAllNbt(nbtData: Uint8Array, count = 1) {
	const resData = []

	let lastOffset = 0
	for (let i = 0; i < count; i++) {
		const { data, size } = readNbt(nbtData, lastOffset)
		resData.push(data)
		lastOffset += size
	}

	return {
		data: resData,
		size: lastOffset,
	}
}
