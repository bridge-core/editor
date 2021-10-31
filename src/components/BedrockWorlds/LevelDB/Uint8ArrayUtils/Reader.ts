const textDecoder = new TextDecoder('utf-8')

export enum ESeekType {
	Start = 0,
	Current = 1,
	End = 2,
}

export class Uint8ArrayReader {
	constructor(protected data: Uint8Array, protected position = 0) {
		this.data = data
	}

	get hasUnreadBytes() {
		return this.position < this.data.length
	}

	clone() {
		return new Uint8ArrayReader(this.data, this.position)
	}
	getPosition() {
		return this.position
	}
	getLength() {
		return this.data.length
	}

	seek(offset: number, where: ESeekType = ESeekType.Start) {
		if (offset > this.data.length) throw new Error('Offset out of bounds')

		let newPosition = this.position

		switch (where) {
			case ESeekType.Start:
				newPosition = offset
				break
			case ESeekType.Current:
				newPosition += offset
				break
			case ESeekType.End:
				newPosition = this.data.length + offset
				break
		}

		if (newPosition < 0) throw new Error('Offset out of bounds')

		this.position = newPosition

		return this.position
	}
	unsafelySetPosition(position: number) {
		this.position = position
	}

	readByte() {
		const byte = this.data[this.position]
		this.position++
		return byte
	}
	readInt32() {
		const a = this.readByte()
		const b = this.readByte()
		const c = this.readByte()
		const d = this.readByte()
		return a | (b << 8) | (c << 16) | (d << 24)
	}
	readUint32() {
		return this.readInt32() >>> 0
	}
	readInt64() {
		const low = BigInt(this.readInt32())
		const high = BigInt(this.readInt32())
		return low | (high << 32n)
	}
	readUint64() {
		return BigInt.asUintN(64, this.readInt64())
	}
	decodeZigZagInt32() {
		const i = this.readInt32()
		return (i >>> 1) ^ -(i & 1)
	}

	readVarLong() {
		let result = 0

		for (let shift = 0; shift < 63; shift += 7) {
			const b = this.readByte()
			result |= (b & 0x7f) << shift

			if ((b & 0x80) === 0) {
				return result
			}
		}

		throw new Error('Invalid varlong')
	}

	read(length: number) {
		if (length > this.data.length - this.position) {
			console.log(length, this.data, this.position)
			throw new Error('Not enough data')
		}

		const bytes = this.data.slice(this.position, this.position + length)
		this.position += length
		return bytes
	}

	readWithOffset(offset: number, length: number) {
		const availableBytes = this.data.length - this.position
		if (availableBytes <= 0) return new Uint8Array(0)

		const bytes = new Uint8Array(offset + length)

		bytes.set(this.read(length), offset)

		return bytes
	}

	readLengthPrefixedBytes() {
		const length = this.readVarLong()
		return this.read(length)
	}
	readLengthPrefixedString() {
		const bytes = this.readLengthPrefixedBytes()
		return textDecoder.decode(bytes)
	}
}
