import { LevelDB } from '../LevelDB/LevelDB'
import { EKeyTypeTag } from './EKeyTypeTags'
import { Chunk } from './Chunk'
import { toUint8Array } from '../LevelDB/Uint8ArrayUtils/ToUint8Array'
import { Block } from './Block'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { BlockLibrary } from '../BlockLibrary/BlockLibrary'
import { RenderSubChunk } from '../Render/World/SubChunk'
import {
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	FrontSide,
	Mesh,
	MeshLambertMaterial,
	NearestFilter,
	Scene,
	Vector3,
	MathUtils,
} from 'three'
import { markRaw } from 'vue'

export class World {
	protected chunks = new Map<string, Chunk>()
	public readonly blockLibrary: BlockLibrary
	public readonly levelDb: LevelDB

	constructor(
		protected worldHandle: AnyDirectoryHandle,
		protected projectHandle: AnyDirectoryHandle,
		protected scene: Scene
	) {
		this.levelDb = markRaw(new LevelDB(this.worldHandle))
		this.blockLibrary = markRaw(new BlockLibrary(this.projectHandle))
	}

	async loadWorld() {
		await Promise.all([this.blockLibrary.setup(), this.levelDb.open()])

		const texture = new CanvasTexture(this.blockLibrary.tileMap)
		texture.magFilter = NearestFilter
		texture.minFilter = NearestFilter
		this.material = new MeshLambertMaterial({
			map: texture,
			side: FrontSide,
			alphaTest: 0.1,
			transparent: true,
		})

		const keys = this.levelDb.keys()

		for (const key of keys) {
			const decoded = this.decodeChunkKey(key)
			if (!decoded) continue
			const { x, z, dimension } = decoded

			const position = new Uint8Array([
				...x,
				...z,
				...(dimension ? dimension : []),
			]).join(',')

			if (!this.chunks.has(position))
				this.chunks.set(position, new Chunk(this, x, z, dimension))
		}
	}

	getSubChunkAt(x: number, y: number, z: number) {
		const chunkX = toUint8Array(Math.floor(x / 16))
		const chunkZ = toUint8Array(Math.floor(z / 16))

		const chunk = this.chunks.get(
			new Uint8Array([...chunkX, ...chunkZ]).join(',')
		)

		return chunk?.getSubChunk(Math.floor(y / 16))
	}

	getBlockAt(layer: number, x: number, y: number, z: number) {
		// console.log(layer, x, y, z, this.getSubChunkAt(x, y, z))
		return (
			this.getSubChunkAt(x, y, z)
				?.getLayer(layer)
				.getBlockAt(
					Math.abs(x < 0 ? (16 + (x % 16)) % 16 : x % 16),
					Math.abs(y < 0 ? (16 + (y % 16)) % 16 : y % 16),
					Math.abs(z < 0 ? (16 + (z % 16)) % 16 : z % 16)
				) ?? new Block('minecraft:air')
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

	// TODO: Move all following methods to its own class dedicated to rendering a world
	protected loadedChunks = new Set<string>()
	protected builtChunks = new Map<string, RenderSubChunk>()
	protected builtChunkMeshes = new Map<string, Mesh>()
	protected renderDistance = 16
	protected material!: MeshLambertMaterial

	async updateCurrentMeshes(currX: number, currY: number, currZ: number) {
		Array.from(this.loadedChunks).forEach((currID) => {
			let mesh = this.builtChunkMeshes.get(currID)
			if (mesh !== undefined) this.scene.remove(mesh)
			this.loadedChunks.delete(currID)
		})

		const max = (this.renderDistance * 16) / 2
		const start = -max

		for (let oX = start; oX <= max; oX += 16)
			for (let oZ = start; oZ <= max; oZ += 16)
				for (let oY = start; oY <= max; oY += 16) {
					const chunkID = this.getChunkId(
						Math.floor((currX + oX) / 16),
						Math.floor((currY + oY) / 16),
						Math.floor((currZ + oZ) / 16)
					)

					if (
						!this.loadedChunks.has(chunkID) &&
						new Vector3(oX, oY, oZ).distanceTo(
							new Vector3(currX, currY, currZ)
						) <
							max * 16
					) {
						let mesh = this.builtChunkMeshes.get(chunkID)
						if (mesh === undefined) {
							this.updateChunkGeometry(
								currX + oX,
								currY + oY,
								currZ + oZ
							)
						} else {
							this.scene.add(mesh)
							this.loadedChunks.add(chunkID)
						}
					}
				}
	}

	updateChunkGeometry(x: number, y: number, z: number) {
		const chunkX = Math.floor(x / 16)
		const chunkY = Math.floor(y / 16)
		const chunkZ = Math.floor(z / 16)
		const chunkId = this.getChunkId(chunkX, chunkY, chunkZ)

		//Building chunks is expensive, skip it whenever possible
		if (this.builtChunks.has(chunkId)) return

		let mesh = this.builtChunkMeshes.get(chunkId)
		let geometry = mesh?.geometry ?? new BufferGeometry()

		const subChunk = this.getSubChunkAt(x, y, z)
		if (!subChunk) return

		const renderSubChunk = new RenderSubChunk(this, subChunk)
		const data = renderSubChunk.getGeometryData()
		if (data === undefined) {
			if (mesh) {
				this.scene.remove(mesh)
				this.loadedChunks.delete(chunkId)
				this.builtChunkMeshes.delete(chunkId)
			}
			return
		}

		const { positions, normals, uvs, indices } = data

		const positionNumComponents = 3
		geometry.setAttribute(
			'position',
			new BufferAttribute(
				new Float32Array(positions),
				positionNumComponents
			)
		)
		const normalNumComponents = 3
		geometry.setAttribute(
			'normal',
			new BufferAttribute(new Float32Array(normals), normalNumComponents)
		)
		const uvNumComponents = 2
		geometry.setAttribute(
			'uv',
			new BufferAttribute(new Float32Array(uvs), uvNumComponents)
		)
		geometry.setIndex(indices)
		geometry.computeBoundingSphere()

		if (mesh === undefined) {
			mesh = new Mesh(geometry, this.material)
			mesh.name = chunkId
			this.builtChunkMeshes.set(chunkId, mesh)
			this.loadedChunks.add(chunkId)
			mesh.position.set(chunkX * 16, chunkY * 16, chunkZ * 16)
			this.scene.add(mesh)
		}
	}

	getChunkId(x: number, y: number, z: number) {
		return `${x},${y},${z}`
	}
}
