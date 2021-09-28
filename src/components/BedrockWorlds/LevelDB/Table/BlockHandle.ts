import { ESeekType, Uint8ArrayReader } from '../Uint8ArrayUtils/Reader'
import { unzlibSync, inflateSync } from 'fflate'

enum ECompressionTypes {
	Uncompressed = 0,
	Snappy = 1,
	Zlib = 2,
}

export class BlockHandle {
	constructor(protected offset: number, protected length: number) {}

	static readBlockHandle(reader: Uint8ArrayReader) {
		const offset = reader.readVarLong()
		const length = reader.readVarLong()

		return new BlockHandle(offset, length)
	}

	getOffset() {
		return this.offset
	}
	getLength() {
		return this.length
	}

	encode() {
		// TODO
	}

	readBlock(
		reader: Uint8ArrayReader,
		length = this.length,
		verifyChecksum = false
	) {
		/**
		 * A block looks like this:
		 *
		 * block :=
		 *   block_data: uint8[]
		 *   type: uint8
		 *   checksum: uint32
		 */

		reader.seek(this.offset, ESeekType.Start)
		let data = reader.read(length)

		const compressionType = reader.readByte()
		const checksum = reader.read(4)

		// TODO: Verify checksum

		switch (compressionType) {
			case ECompressionTypes.Snappy:
				throw new Error('Snappy compression not implemented')
			// Do nothing
			case ECompressionTypes.Uncompressed:
				break
			default: {
				if (compressionType === ECompressionTypes.Zlib) {
					if (data[0] !== 0x78) {
						throw new Error('Invalid zlib header')
					}

					data = data.slice(2)
				}

				data = inflateSync(data)
			}
		}

		return data
	}
}
