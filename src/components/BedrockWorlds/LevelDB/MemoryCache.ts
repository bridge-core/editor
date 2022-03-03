import { BytewiseComparator } from './Comparators/Bytewise'
import { toStrKey } from './Key/ToStrKey'
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
	protected cache: Map<string, ILogEntry> = new Map()
	protected size = 0

	load(logReader: LogReader) {
		this.cache = new Map()

		let data: Uint8Array | null
		while (true) {
			data = logReader.readData()
			if (data === null) break

			const logEntries = this.decodeData(data).sort((a, b) => {
				const res = a[1].sequenceNumber - b[1].sequenceNumber
				if (res === 0n) return 0
				return res < 0n ? -1 : 1
			})

			for (const [key, value] of logEntries) {
				this.set(key, value)
				this.size += key.length + (value.data?.length ?? 0)
			}
		}
	}

	protected decodeData(data: Uint8Array) {
		const reader = new Uint8ArrayReader(data)
		const sequenceNumber = reader.readUint64()
		const totalOperations = reader.readUint32()

		const res: [Uint8Array, ILogEntry][] = []

		for (let i = 0; i < totalOperations; i++) {
			const operation = reader.readByte()
			const key = reader.readLengthPrefixedBytes()

			if (operation === EOperationType.PUT) {
				const value = reader.readLengthPrefixedBytes()

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
		const entry = this.cache.get(toStrKey(key))
		if (entry === undefined) {
			return RequestStatus.createNotFound()
		}
		return new RequestStatus(entry.data, entry.state)
	}
	set(key: Uint8Array, val: ILogEntry) {
		this.cache.set(toStrKey(key), val)
	}
	keys() {
		return [...this.cache.keys()].map(
			(str) => new Uint8Array(str.split(' ').map((n) => Number(n)))
		)
	}
}
