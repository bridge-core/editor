import { BytewiseComparator } from './Comparators/Bytewise'
import { EOperationType, LogReader } from './LogReader'
import { ERequestState, RequestStatus } from './RequestStatus'
import { Uint8ArrayReader } from './Uint8ArrayUtils/Reader'

interface ILogEntry {
	sequenceNumber: bigint
	state: ERequestState
	data?: Uint8Array
}

export class MemoryCache {
	protected comparator = new BytewiseComparator()
	protected cache: Map<Uint8Array, ILogEntry> = new Map()
	protected size = 0

	load(logReader: LogReader) {
		this.cache = new Map()

		let data: Uint8Array | null
		while (true) {
			data = logReader.readData()
			if (data === null) break

			const logEntries = this.decodeData(new Uint8ArrayReader(data))
			for (const [key, value] of logEntries) {
				this.cache.set(key, value)
				this.size += key.length + (value.data?.length ?? 0)
			}
		}
	}

	protected decodeData(data: Uint8ArrayReader) {
		const sequenceNumber = data.readUint64()
		const totalOperations = data.readUint32()

		const res: [Uint8Array, ILogEntry][] = []

		for (let i = 0; i < totalOperations; i++) {
			const operation = data.readByte()
			const key = data.readLengthPrefixedBytes()

			if (operation === EOperationType.PUT) {
				const value = data.readLengthPrefixedBytes()

				res.push([
					key,
					{
						sequenceNumber,
						state: ERequestState.Success,
						data: value,
					},
				])
			} else if (operation === EOperationType.Delete) {
				res.push([
					key,
					{
						sequenceNumber,
						state: ERequestState.Deleted,
					},
				])
			} else {
				throw new Error('Unknown operation type')
			}
		}
		return res
	}

	get(key: Uint8Array) {
		const entry = this.cache.get(key)
		if (entry === undefined) {
			return RequestStatus.createNotFound()
		}
		return new RequestStatus(entry.data)
	}
	keys() {
		return this.cache.keys()
	}
}
