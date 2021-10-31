import { AnyFileHandle } from '../../../FileSystem/Types'
import { BytewiseComparator } from '../Comparators/Bytewise'
import { asUsableKey } from '../Key/AsUsableKey'
import { getKeyType } from '../Key/GetKeyType'
import { RequestStatus } from '../RequestStatus'
import { Uint8ArrayReader } from '../Uint8ArrayUtils/Reader'
import { BlockHandle } from './BlockHandle'
import { BlockSeeker } from './BlockSeeker'
import { TableFooter } from './Footer'

enum EKeyType {
	Deleted = 0,
	Exists = 1,
}

export class Table {
	protected blockIndex: Uint8Array | null = null
	protected metaIndex: Uint8Array | null = null
	protected cache = new Map<BlockHandle, Uint8Array>()
	protected reader!: Uint8ArrayReader
	comparator = new BytewiseComparator()

	constructor(protected fileHandle: AnyFileHandle) {}

	async load() {
		const fileData = await this.fileHandle
			.getFile()
			.then((file) => file.arrayBuffer())
			.then((buffer) => new Uint8Array(buffer))
		this.reader = new Uint8ArrayReader(fileData)

		if (this.blockIndex === null || this.metaIndex === null) {
			const footer = TableFooter.read(this.reader)

			this.metaIndex = footer.metaIndexBlockHandle.readBlock(this.reader)
			this.blockIndex = footer.dataIndexBlockHandle.readBlock(this.reader)
		}
	}

	get(key: Uint8Array) {
		const blockHandle = this.findBlockHandleInBlockIndex(key)
		if (blockHandle === null) {
			console.warn(`Expected to find key within this table`)
			return RequestStatus.createNotFound()
		}

		const block = this.getBlock(blockHandle)

		return this.searchKeyInBlockData(key, block)
	}
	keys() {
		if (this.blockIndex === null) throw new Error('Block index not loaded')

		const blockHelper = new BlockSeeker(this.blockIndex)
		return blockHelper.keys()
	}

	protected getBlock(blockHandle: BlockHandle) {
		if (this.cache.has(blockHandle)) {
			return this.cache.get(blockHandle)!
		}

		const block = blockHandle.readBlock(this.reader)
		if (this.cache.size > 50) {
			const keys = this.cache.keys()
			for (let i = 0; i < 25; i++) this.cache.delete(keys.next().value)
		}

		this.cache.set(blockHandle, block)

		return block
	}

	protected findBlockHandleInBlockIndex(key: Uint8Array) {
		if (this.blockIndex === null) throw new Error('Block index not loaded')

		const searchHelper = new BlockSeeker(this.blockIndex)
		if (searchHelper.binarySearchKey(key)) {
			const foundKey = searchHelper.getCurrentKey()
			if (foundKey === null) throw new Error('Key not found')

			const usableKey = asUsableKey(foundKey)
			if (this.comparator.compare(usableKey, key) < 0) return null

			const val = searchHelper.getCurrentValue()
			if (val === null) return null

			return BlockHandle.readBlockHandle(new Uint8ArrayReader(val))
		}

		return null
	}
	protected searchKeyInBlockData(key: Uint8Array, blockData: Uint8Array) {
		const searchHelper = new BlockSeeker(blockData)

		if (searchHelper.binarySearchKey(key)) {
			const foundKey = searchHelper.getCurrentKey()
			if (foundKey === null) throw new Error('Key not found')

			const keyType = getKeyType(foundKey)
			const usableKey = asUsableKey(foundKey)

			if (this.comparator.compare(usableKey, key) === 0) {
				switch (keyType) {
					case EKeyType.Deleted: {
						// console.log('DELETED')
						return RequestStatus.createDeleted()
					}
					case EKeyType.Exists: {
						// console.log('EXISTS')
						return new RequestStatus(searchHelper.getCurrentValue())
					}
					default: {
						console.warn(`Unknown key type ${keyType}`)
					}
				}
			}
		}

		// console.log('NOT FOUND')
		return RequestStatus.createNotFound()
	}
}
