import { LevelDB } from '../LevelDB/LevelDB'
import { EKeyTypeTag } from './EKeyTypeTags'
import { Chunk } from './Chunk'
import { toUint8Array } from '../LevelDB/Uint8ArrayUtils/ToUint8Array'
import { Block } from './Block'

export class World {
	protected chunks = new Map<Uint8Array, Chunk>()

	constructor(public readonly levelDb: LevelDB) {
		this.loadWorld()
		console.log(this.chunks)
	}

	loadWorld() {
		const keys = this.levelDb.keys()

		for (const key of keys) {
			const decoded = this.decodeChunkKey(key)
			if (!decoded) continue
			const { x, z, dimension } = decoded

			const position = new Uint8Array([
				...x,
				...z,
				...(dimension ? dimension : []),
			])

			if (!this.chunks.has(position))
				this.chunks.set(position, new Chunk(this, x, z, dimension))
		}
	}

	getBlockAt(layer: number, x: number, y: number, z: number) {
		const chunkX = toUint8Array(Math.floor(x / 16))
		const chunkZ = toUint8Array(Math.floor(z / 16))

		const chunk = this.chunks.get(new Uint8Array([...chunkX, ...chunkZ]))

		return (
			chunk
				?.getSubChunk(Math.floor(y / 16))
				.getLayer(layer)
				.getBlockAt(x % 16, y % 16, z % 16) ??
			new Block('minecraft:air')
		)
	}

	decodeChunkKey(key: Uint8Array) {
		if (![9, 10, 13, 14].includes(key.length)) return null

		/**
		 * Chunk key format
		 * 1) little endian int32 (chunk x coordinate)
		 * 2) little endian int32 (chunk z coordinate)
		 * 3) optional little endian int32 (dimension)
		 * 4) key type byte (see EKeyTypeTag)
		 * 5) one byte for SubChunkPrefix data when type is EKeyTypeTag.SubChunkPrefix
		 */

		const x = key.slice(0, 4)
		const z = key.slice(4, 8)

		// Optional dimension is defined if key is long enough
		const dimension = key.length >= 13 ? key.slice(8, 12) : undefined

		const keyTypeByte = key[key.length - 2]
		const subChunkPrefixByte =
			keyTypeByte === EKeyTypeTag.SubChunkPrefix &&
			(key.length === 10 || key.length === 14)
				? key[key.length - 1]
				: null

		return {
			x: x,
			z: z,
			dimension: dimension,
			keyType: keyTypeByte,
			subChunkPrefix: subChunkPrefixByte,
		}
	}
}
