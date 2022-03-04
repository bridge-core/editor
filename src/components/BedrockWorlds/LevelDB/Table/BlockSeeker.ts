import { BytewiseComparator } from '../Comparators/Bytewise'
import { asUsableKey } from '../Key/AsUsableKey'
import { ESeekType, Uint8ArrayReader } from '../Uint8ArrayUtils/Reader'
import { BlockHandle } from './BlockHandle'

export class BlockSeeker {
	protected comparator = new BytewiseComparator()
	protected reader: Uint8ArrayReader
	protected restartCount = 0 // Amount of restart points
	protected restartOffset = 0 // Current restart point
	protected currentKey: Uint8Array | null = null
	protected currentValue: BlockHandle | null = null

	constructor(protected blockData: Uint8Array) {
		this.reader = new Uint8ArrayReader(blockData)
		this.reader.seek(-4, ESeekType.End)
		this.restartCount = this.reader.readUint32()
		this.reader.seek(-((1 + this.restartCount) * 4), ESeekType.End)
		this.restartOffset = this.reader.getPosition()

		this.reader.seek(0, ESeekType.Start)
	}

	getCurrentKey() {
		return this.currentKey
	}
	getCurrentValue() {
		this.reader.seek(this.currentValue!.getOffset(), ESeekType.Start)
		return this.reader.read(this.currentValue!.getLength())
	}

	binarySearchKey(key: Uint8Array) {
		if (this.restartCount === 0) return false

		let low = 0
		let high = this.restartCount - 1

		while (low < high) {
			const mid = Math.floor((low + high + 1) / 2)
			this.seekToRestart(mid)

			if (
				this.comparator.compare(asUsableKey(this.currentKey!), key) < 0
			) {
				low = mid
			} else {
				high = mid - 1
			}
		}

		for (let i = low; i >= 0; i--) {
			this.seekToRestart(i)

			while (this.hasNext()) {
				const usableKey = asUsableKey(this.currentKey!)

				if (this.comparator.compare(usableKey, key) >= 0) {
					return true
				}
				this.next()
			}
		}

		return false
	}
	keys() {
		let keys: Uint8Array[] = []
		for (let i = 0; i < this.restartCount; i++) {
			this.seekToRestart(i)

			while (this.hasNext()) {
				keys.push(asUsableKey(this.currentKey!))
				this.next()
			}
		}

		return keys
	}

	hasNext() {
		return this.currentKey !== null && this.currentKey.length !== 0
	}
	next() {
		if (!this.hasNext()) return false

		return this.parseCurrentIndex()
	}

	protected getRestartOffset(index: number) {
		if (index < 0) throw new Error('Index must be greater than 0')
		if (index >= this.restartCount)
			throw new Error('Index must be less than restart count')

		const reader = new Uint8ArrayReader(this.blockData)
		reader.seek(this.restartOffset + index * 4, ESeekType.Start)
		return reader.readUint32()
	}
	protected seekToRestart(index: number) {
		const offset = this.getRestartOffset(index)
		this.reader.unsafelySetPosition(offset)
		this.currentKey = null
		this.parseCurrentIndex()
	}

	protected parseCurrentIndex() {
		if (this.reader.getPosition() >= this.reader.getLength() - 4) {
			this.currentKey = null
			return false
		}

		/**
		 * Read key-val pair
		 *
		 * index :=
		 * shared = varint32;
		 * non_shared = varint32;
		 * value_length = varint32;
		 * key_delta = char[non_shared];
		 */
		const shared = this.reader.readVarLong()
		if (this.currentKey === null && shared !== 0)
			throw new Error(`Shared bytes without a currentKey`)

		const nonShared = this.reader.readVarLong()
		const valueLength = this.reader.readVarLong()
		const keyDelta = this.reader.read(nonShared)

		const combinedKey = new Uint8Array(shared + nonShared)
		if (shared !== 0) combinedKey.set(this.currentKey!.slice(0, shared), 0)
		combinedKey.set(keyDelta.slice(0, nonShared), shared)
		this.currentKey = combinedKey

		this.currentValue = new BlockHandle(
			this.reader.getPosition(),
			valueLength
		)
		this.reader.seek(valueLength, ESeekType.Current)
		return true
	}
}
