import { EKeyTypeTag } from './EKeyTypeTags'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
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
	DataTexture,
	Texture,
	DoubleSide,
} from 'three'
import { readAllNbt, simplify } from './readNbt'
import type { WorldWorker as TWorldWorker } from '../Worker/WorldWorker'
import Worker from '../Worker/WorldWorker?worker'
import { Remote, wrap } from 'comlink'
import { FileSystem } from '../../FileSystem/FileSystem'

const WorldWorker = wrap<typeof TWorldWorker>(new Worker())
export class World {
	protected _worker?: Remote<TWorldWorker>

	constructor(
		protected baseDirectory: AnyDirectoryHandle,
		protected worldHandle: AnyDirectoryHandle,
		protected projectHandle: AnyDirectoryHandle,
		protected scene: Scene
	) {}

	get worker() {
		if (!this._worker)
			throw new Error(`World worker is not initialized yet`)
		return this._worker
	}

	async loadWorld() {
		let playerPosition = <const>[0, 0, 0]
		let playerRotation: [number, number] | null = null

		if (!this._worker)
			this._worker = await new WorldWorker(this.baseDirectory, {
				config: `projects/${this.projectHandle.name}/config.json`,
				worldPath: `projects/${this.projectHandle.name}/worlds/${this.worldHandle.name}`,
			})

		await this.worker.open()

		const fs = new FileSystem(this.baseDirectory)
		const image = new Image()
		image.src = await fs.loadFileHandleAsDataUrl(
			await fs.getFileHandle(
				`projects/${this.projectHandle.name}/.bridge/bedrockWorld/uvMap.png`
			)
		)

		const texture = new Texture(image) //new CanvasTexture(await this.worker.getTileMap())
		texture.magFilter = NearestFilter
		texture.minFilter = NearestFilter
		this.material = new MeshLambertMaterial({
			map: texture,
			side: FrontSide,
			alphaTest: 0.1,
			transparent: false,
		})

		const rawPlayerData = await this.worker.getFromLevelDb(
			new TextEncoder().encode('~local_player')
		)
		if (rawPlayerData) {
			const playerData = simplify(readAllNbt(rawPlayerData).data[0])
			console.log(playerData)

			playerPosition = playerData.Pos
			playerRotation = playerData.Rotation
		}

		return {
			playerPosition,
			playerRotation,
		}
	}

	getSubChunkDataAt(x: number, y: number, z: number) {
		if (!this._worker) return

		// console.log(this.worker.getSubChunkDataAt(x, y, z))
		return this.worker.getSubChunkDataAt(x, y, z)
	}

	getBlockAt(layer: number, x: number, y: number, z: number) {
		return this.worker.getBlockAt(layer, x, y, z)
	}

	decodeChunkKey(key: Uint8Array) {
		if (![9, 10, 13, 14].includes(key.length)) return null

		/**
		 * Chunk key format
		 * 1) little endian int32 (chunk x coordinate) (4 bytes)
		 * 2) little endian int32 (chunk z coordinate) (4 bytes)
		 * 3) optional little endian int32 (dimension) (4 bytes)
		 * 4) key type byte (see EKeyTypeTag)
		 * 5) one byte for SubChunkPrefix data when type is EKeyTypeTag.SubChunkPrefix
		 */

		const x = key.slice(0, 4)
		const z = key.slice(4, 8)

		// Optional dimension is defined if key is long enough
		const dimension = key.length >= 13 ? key.slice(8, 12) : undefined

		const keyTypeByte =
			key[key.length > 13 ? key.length - 2 : key.length - 1]
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
	protected builtChunkMeshes = new Map<string, Mesh>()
	protected renderDistance = 16
	protected material!: MeshLambertMaterial
	protected updateInProgress = false

	async updateCurrentMeshes(currX: number, currY: number, currZ: number) {
		if (this.updateInProgress) return
		this.updateInProgress = true

		Array.from(this.loadedChunks).forEach((currID) => {
			let mesh = this.builtChunkMeshes.get(currID)
			if (mesh !== undefined) this.scene.remove(mesh)
			this.loadedChunks.delete(currID)
		})

		const max = (this.renderDistance * 16) / 2
		const start = -max

		for (let oX = start; oX <= max; oX += 16) {
			for (let oZ = start; oZ <= max; oZ += 16) {
				for (let oY = start; oY <= max; oY += 16) {
					const chunkId = this.getChunkId(
						Math.floor((currX + oX) / 16),
						Math.floor((currY + oY) / 16),
						Math.floor((currZ + oZ) / 16)
					)
					// console.log(chunkID)

					if (
						!this.loadedChunks.has(chunkId) &&
						new Vector3(oX, oY, oZ).distanceTo(
							new Vector3(currX, currY, currZ)
						) <
							max * 16
					) {
						//Building chunks is expensive, skip it whenever possible
						let mesh = this.builtChunkMeshes.get(chunkId)
						if (mesh === undefined)
							mesh = await this.updateChunkGeometry(
								currX + oX,
								currY + oY,
								currZ + oZ
							)

						if (mesh) {
							this.scene.add(mesh)
							this.builtChunkMeshes.set(chunkId, mesh)
							this.loadedChunks.add(chunkId)
						}
					}
				}
			}
		}

		this.updateInProgress = false
		console.log(this.scene)
	}

	async updateChunkGeometry(x: number, y: number, z: number) {
		const chunkX = Math.floor(x / 16)
		const chunkY = Math.floor(y / 16)
		const chunkZ = Math.floor(z / 16)
		const chunkId = this.getChunkId(chunkX, chunkY, chunkZ)

		let mesh = this.builtChunkMeshes.get(chunkId)
		let geometry = mesh?.geometry ?? new BufferGeometry()

		const subChunkData = await this.getSubChunkDataAt(x, y, z)
		if (subChunkData === undefined) {
			// TODO: Empty chunk data should probably also get cached instead of just removing those subchunks from all caches
			if (mesh) {
				this.scene.remove(mesh)
				this.loadedChunks.delete(chunkId)
				this.builtChunkMeshes.delete(chunkId)
			}
			return
		}

		const { positions, normals, uvs, indices } = subChunkData

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
			mesh.position.set(chunkX * 16, chunkY * 16, chunkZ * 16)
		}

		return mesh
	}

	getChunkId(x: number, y: number, z: number) {
		return `${x},${y},${z}`
	}
}
