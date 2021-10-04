import { Uint8ArrayReader } from '../LevelDB/Uint8ArrayUtils/Reader'
import { EDimension } from './EDimension'
import { EKeyTypeTag } from './EKeyTypeTags'
import { simplify } from 'prismarine-nbt'
import { readAllNbt, readNbt } from './readNbt'
import { unpackStruct } from '../LevelDB/Uint8ArrayUtils/Unpack'
import { Block, IBlock } from './Block'
import type { World } from './World'

export class Chunk {
	protected subChunks: SubChunk[] = []

	constructor(
		protected world: World,
		public readonly x: Uint8Array,
		public readonly z: Uint8Array,
		public readonly dimension = new Uint8Array([0, 0, 0, 0])
	) {
		this.loadSubChunks()
		// const entityData = this.loadNbtData(EKeyTypeTag.Entity)
		// if (entityData) console.log(entityData)
		// const blockEntity = this.loadNbtData(EKeyTypeTag.BlockEntity)
		// if (blockEntity) console.log(blockEntity)
		// const pendingTicks = this.loadNbtData(EKeyTypeTag.PendingTicks)
		// if (pendingTicks) console.log(pendingTicks)
		// const BlockExtraData = this.loadNbtData(EKeyTypeTag.BlockExtraData)
		// if (BlockExtraData) console.log(BlockExtraData)
	}

	getDimension() {
		return new Uint8ArrayReader(this.dimension).readInt32()
	}
	getX() {
		return new Uint8ArrayReader(this.x).readInt32()
	}
	getZ() {
		return new Uint8ArrayReader(this.z).readInt32()
	}

	getLevelDb() {
		return this.world.levelDb
	}

	getSubChunk(n: number) {
		return this.subChunks[n]
	}

	loadSubChunks() {
		for (let i = 0; i < 16; i++) {
			this.subChunks.push(new SubChunk(this, i))
		}
	}

	getChunkKey(tagType: EKeyTypeTag) {
		const dimension = this.getDimension()
		const key = new Uint8Array(
			9 + // x + z coordinate + 1 byte for key type tag
				(dimension === EDimension.Overworld ? 0 : 4) // dimension
		)
		key.set(this.x, 0)
		key.set(this.z, 4)
		let offset = 0
		if (dimension !== EDimension.Overworld) {
			key.set(this.dimension, 8)
			offset = 4
		}

		key[8 + offset] = tagType

		return key
	}

	protected loadData(tagType: EKeyTypeTag) {
		if (tagType === EKeyTypeTag.SubChunkPrefix)
			throw new Error(
				'SubChunkPrefix data should be loaded by sub chunks'
			)

		return this.getLevelDb().get(this.getChunkKey(tagType))
	}

	protected loadNbtData(tagType: EKeyTypeTag) {
		const data = this.loadData(tagType)
		if (!data) return null

		let offset = 0
		const length = data.length

		const loadedNbt = []
		while (offset < length) {
			const { data: d, size } = readNbt(data, offset)
			loadedNbt.push(simplify(d))
			offset += size
		}

		return loadedNbt
	}
}

const totalBlockSpaces = 4096 // 16 * 16 * 16

export class SubChunk {
	public blockLayers: BlockLayer[] = []

	constructor(public readonly parent: Chunk, public readonly y: number) {
		let blockData = this.loadData()

		if (blockData) {
			// This var stores how many blocks can be stored in a single block space (e.g. waterlogged blocks)
			let blocksPerBlockSpace = 1

			// First byte in blockData is sub chunk version
			if (blockData[0] === 1) {
				blockData = blockData.slice(1)
			} else if (blockData[0] === 8) {
				blocksPerBlockSpace = blockData[1]
				blockData = blockData.slice(2)
			} else if (blockData[0] === 9) {
				blocksPerBlockSpace = blockData[1]
				// Extra byte stores sub chunk y coordinate
				blockData = blockData.slice(3)
			} else {
				throw new Error(
					`Unknown sub chunk format version: ${blockData[0]}`
				)
			}

			for (
				let blockSpaceIndex = 0;
				blockSpaceIndex < blocksPerBlockSpace;
				blockSpaceIndex++
			) {
				const { blocks, palette, data } = this.loadBlockPalette(
					blockData
				)
				blockData = data
				this.blockLayers.push(new BlockLayer(blocks, palette))
			}
		} else {
			this.blockLayers.push(new EmptyBlockLayer())
		}
	}

	getLayer(index: number) {
		if (index < 0 || index >= this.blockLayers.length) {
			throw new Error(`Invalid layer index: ${index}`)
		}

		return this.blockLayers[index]
	}

	protected loadBlockPalette(data: Uint8Array) {
		const bitsPerBlock = data[0] >>> 1
		data = data.slice(1)

		if (bitsPerBlock === 0) {
			const { data: nbtData, size } = readNbt(data, 0)

			return {
				blocks: new Uint16Array(totalBlockSpaces),
				palette: simplify(nbtData),
				data: data.slice(0, size),
			}
		} else {
			// One word consists of 4 bytes
			const blocksPerWord = Math.floor(32 / bitsPerBlock)
			const wordCount = Math.ceil(totalBlockSpaces / blocksPerWord)
			const padding =
				bitsPerBlock === 3 || bitsPerBlock === 5 || bitsPerBlock === 6
					? 2
					: 0

			let rawBlocks = new Uint8Array(wordCount * 4)
			rawBlocks.set(data.slice(0, wordCount * 4))
			data = data.slice(wordCount * 4)

			const processedBlocks = new Uint16Array(totalBlockSpaces)
			let position = 0
			for (let wordIndex = 0; wordIndex < wordCount; wordIndex++) {
				const rawWord = rawBlocks.slice(
					wordIndex * 4,
					(wordIndex + 1) * 4
				)
				const uint32Word = new DataView(rawWord.buffer).getUint32(
					0,
					true
				)

				for (
					let blockIndex = 0;
					blockIndex < blocksPerWord;
					blockIndex++
				) {
					const blockId =
						(uint32Word >>
							((position % blocksPerWord) * bitsPerBlock)) &
						((1 << bitsPerBlock) - 1)
					processedBlocks[position] = blockId
					position++
				}
			}

			const paletteLength = unpackStruct(data.slice(0, 4))
			data = data.slice(4)

			const { data: nbtData, size } = readAllNbt(data, paletteLength)

			// console.log(size, data.slice(0, size))
			return {
				blocks: processedBlocks,
				palette: nbtData.map((d) => simplify(d)),
				data: data.slice(size),
			}
		}
	}

	protected loadData() {
		return this.parent.getLevelDb().get(this.getSubChunkPrefixKey())
	}

	protected getSubChunkPrefixKey() {
		return new Uint8Array([
			...this.parent.getChunkKey(EKeyTypeTag.SubChunkPrefix),
			this.y,
		])
	}
}

export class BlockLayer {
	constructor(protected blocks: Uint16Array, protected pallete: any[]) {
		// console.log(pallete)
	}

	getBlockAt(x: number, y: number, z: number): IBlock {
		if (x < 0 || x >= 16 || y < 0 || y >= 16 || z < 0 || z >= 16) {
			throw new Error(`Invalid block coordinates: ${x}, ${y}, ${z}`)
		}

		const numericId = this.blocks[y + z * 16 + x * 256]
		const block = this.pallete[numericId]

		return block ?? new Block('minecraft:info_update')
	}
}

export class EmptyBlockLayer extends BlockLayer {
	constructor() {
		super(new Uint16Array(totalBlockSpaces), [])
	}

	getBlockAt(x: number, y: number, z: number): IBlock {
		return new Block('minecraft:air')
	}
}
