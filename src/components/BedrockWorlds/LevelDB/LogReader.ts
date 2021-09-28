import { AnyFileHandle } from '../../FileSystem/Types'
import { ELogRecordType, Record, UndefinedRecord } from './Record'

export enum EOperationType {
	Delete = 0,
	PUT = 1,
}

export class LogReader {
	protected blockSize = 32768 // Size of a single block (32 * 1024 Bytes)
	protected headerSize = 4 + 2 + 1
	protected position: number = 0
	protected lastData: Uint8Array | null = null
	protected _logFileData?: Uint8Array

	constructor() {}

	get logFileData() {
		if (!this._logFileData)
			throw new Error(
				'Trying to access logFileData before file was loaded'
			)
		return this._logFileData
	}

	async readLogFile(fileHandle: AnyFileHandle) {
		const file = await fileHandle.getFile()
		this._logFileData = new Uint8Array(await file.arrayBuffer())

		this.position = 0
	}

	readData(logFileData: Uint8Array = this.logFileData) {
		let lastRecord = new UndefinedRecord()

		while (this.position < logFileData.length) {
			while (true) {
				let record = this.readNextRecord(logFileData)

				if (record.type === ELogRecordType.BadRecord) {
					break
				} else if (record.type === ELogRecordType.First) {
					lastRecord = record
					continue
				} else if (record.type === ELogRecordType.Zero) {
					// Ignore other record types
					continue
				}

				if (
					lastRecord.type !== ELogRecordType.Undefined &&
					(record.type === ELogRecordType.Middle ||
						record.type == ELogRecordType.Last)
				) {
					lastRecord.length! += record.length!
					var lastData = lastRecord.data!
					lastRecord.data = new Uint8Array(
						lastData.length + record.data!.length
					)
					lastRecord.data.set(lastData)
					lastRecord.data.set(record.data!, lastData.length)

					if (record.type == ELogRecordType.Middle) {
						continue
					}

					record = lastRecord
					record.type = ELogRecordType.Full
				}

				if (record.type !== ELogRecordType.Full) {
					console.warn(`Read unhandled record of type ${record.type}`)
					continue
				}

				return record.data!
			}
		}

		return null
	}

	protected readNextRecord(logFileData: Uint8Array) {
		// Blocks may be padded if size left is less than the header
		const sizeLeft = this.blockSize - (this.position % this.blockSize)
		// if (sizeLeft < 7) stream.Seek(sizeLeft, SeekOrigin.Current);

		// Header is checksum (4 bytes), length (2 bytes), type (1 byte).
		const header = this.consumeBytes(logFileData, this.headerSize)
		if (header.length !== this.headerSize)
			return new Record({ type: ELogRecordType.BadRecord })

		const expectedCrc =
			header[0] + (header[1] << 8) + (header[2] << 16) + (header[3] << 24)
		const length = header[4] + (header[5] << 8)
		const type = header[6]

		if (length > logFileData.length)
			throw new Error('Not enough data in stream to read')

		const data = this.consumeBytes(logFileData, length)

		// uint actualCrc = Crc32C.Compute(type);
		// actualCrc = Crc32C.Mask(Crc32C.Append(actualCrc, data));

		const record = new Record({
			checksum: expectedCrc,
			length,
			type,
			data,
		})

		// if (record.type !== ELogRecordType.Zero && expectedCrc != actualCrc) {
		// 	throw new Error(`Corrupted data. Failed checksum test. Excpeted {expectedCrc}, but calculated actual {actualCrc}`);
		// }

		return record
	}

	protected consumeBytes(logFileData: Uint8Array, byteCount: number) {
		const consumed = logFileData.slice(
			this.position,
			this.position + byteCount
		)
		this.position += byteCount
		return consumed
	}
}
