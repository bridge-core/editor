const textEncoder = new TextEncoder()

export async function writableToUint8Array(data: BufferSource | Blob | string) {
	let rawData: Uint8Array
	if (typeof data === 'string') rawData = textEncoder.encode(data)
	else if (data instanceof Blob)
		rawData = await data
			.arrayBuffer()
			.then((buffer) => new Uint8Array(buffer))
	else if (!ArrayBuffer.isView(data)) rawData = new Uint8Array(data)
	else rawData = new Uint8Array(data.buffer)

	return rawData
}
