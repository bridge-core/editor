import { equals } from '../Uint8ArrayUtils/Equals'
import { ESeekType, Uint8ArrayReader } from '../Uint8ArrayUtils/Reader'
import { BlockHandle } from './BlockHandle'

export class TableFooter {
	protected static magicNumber: Uint8Array = new Uint8Array([
		0x57,
		0xfb,
		0x80,
		0x8b,
		0x24,
		0x75,
		0x47,
		0xdb,
	])
	/**
	 * Table footer contains padding to always reach 48 bytes
	 *
	 * 20 = max length of block handle
	 * 8 = magic byte sequence length
	 *
	 * 48 = (20 * 2) + 8
	 */
	protected static footerLength = 48

	constructor(
		public metaIndexBlockHandle: BlockHandle,
		public dataIndexBlockHandle: BlockHandle
	) {}

	static read(reader: Uint8ArrayReader) {
		reader.seek(-this.footerLength, ESeekType.End)
		const footerReader = new Uint8ArrayReader(
			reader.read(this.footerLength)
		)

		const metaIndexBlockHandle = BlockHandle.readBlockHandle(footerReader)
		const dataIndexBlockHandle = BlockHandle.readBlockHandle(footerReader)

		footerReader.seek(-this.magicNumber.length, ESeekType.End)
		const magicNumber = footerReader.read(this.magicNumber.length)

		if (!equals(magicNumber, this.magicNumber)) {
			throw new Error('Invalid magic number')
		}

		return new TableFooter(metaIndexBlockHandle, dataIndexBlockHandle)
	}
}
