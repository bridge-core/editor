import { EKeyTypeTag } from './EKeyTypeTags'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import {
	BufferAttribute,
	BufferGeometry,
	FrontSide,
	Mesh,
	MeshLambertMaterial,
	Scene,
	Vector3,
} from 'three'
import { readAllNbt, simplify } from './readNbt'
import type { WorldWorker as TWorldWorker } from '../Worker/WorldWorker'
import Worker from '../Worker/WorldWorker?worker'
import { Remote, wrap } from 'comlink'
import { EventDispatcher } from '../../Common/Event/EventDispatcher'
import { IDisposable } from '/@/types/disposable'
import { BlockLibrary } from '../BlockLibrary/BlockLibrary'

function createWorldWorker() {
	const worker = new Worker()
	return {
		WorldWorker: wrap<typeof TWorldWorker>(worker),
		dispose: () => worker.terminate(),
	}
}
export class World {
	protected _workers?: Remote<TWorldWorker>[]
	protected workerIndex = 0
	protected disposables: IDisposable[] = []

	constructor(
		protected baseDirectory: AnyDirectoryHandle,
		protected worldHandle: AnyDirectoryHandle,
		protected projectHandle: AnyDirectoryHandle,
		protected scene: Scene
	) {}

	get worker() {
		if (!this._workers || this._workers.length === 0)
			throw new Error(`World worker pool is not initialized yet`)

		if (this.workerIndex === this._workers.length) this.workerIndex = 0
		return this._workers[this.workerIndex++]
	}

	async loadWorld() {
		let playerPosition = <const>[0, 0, 0]
		let playerRotation: [number, number] | null = null

		// const blockLib = new BlockLibrary(this.projectHandle)
		// await blockLib.setup()

		// const texture = new CanvasTexture(
		// 	blockLib.tileMap.transferToImageBitmap()
		// ) /*new DataTexture(data, width, height, RGBAFormat)*/
		// texture.magFilter = NearestFilter
		// texture.minFilter = NearestFilter
		this.material = new MeshLambertMaterial({
			// map: texture,
			color: 0x088cdc,
			side: FrontSide,
			alphaTest: 0.1,
			transparent: false,
		})

		// Initialize workerPool
		if (!this._workers) {
			this._workers = []
			for (let i = 0; i < navigator.hardwareConcurrency - 1; i++) {
				const { WorldWorker, dispose } = createWorldWorker()
				this.disposables.push({ dispose })

				const worker = await new WorldWorker(this.baseDirectory, {
					config: `projects/${this.projectHandle.name}/config.json`,
					worldPath: `projects/${this.projectHandle.name}/worlds/${this.worldHandle.name}`,
				})
				await worker.open()

				this._workers.push(worker)
			}
		}

		// const { data, width, height } =
		// 	(await this.worker.getRawTileMap()) ?? {}
		// if (!data || !width || !height) throw new Error('No tile map data')

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
	dispose() {
		this.disposables.forEach((disposable) => disposable.dispose())
	}

	getSubChunkDataAt(x: number, y: number, z: number) {
		if (!this._workers || this._workers.length === 0) return

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
	protected renderDistance = 8
	protected material!: MeshLambertMaterial
	protected pendingChunkRequests = new Set<string>()
	public readonly chunkUpdate = new EventDispatcher<void>()

	updateCurrentMeshes(currX: number, currY: number, currZ: number) {
		const max = (this.renderDistance * 16) / 2
		const start = -max

		const currPosition = new Vector3(currX, currY, currZ)

		Array.from(this.loadedChunks).forEach((currId) => {
			const [x, y, z] = currId.split(',').map((n) => Number(n))

			// Only remove chunks which are outside of the render distance
			if (
				currPosition.distanceTo(new Vector3(x * 16, y * 16, z * 16)) >
				max * 16
			) {
				this.removeLoadedMesh(currId)
				this.chunkUpdate.dispatch()
			}
		})

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
						currPosition.distanceTo(new Vector3(oX, oY, oZ)) <=
							max * 16
					) {
						//Building chunks is expensive, skip it whenever possible
						let mesh = this.builtChunkMeshes.get(chunkId)
						if (mesh === undefined) {
							if (this.pendingChunkRequests.has(chunkId)) return
							this.pendingChunkRequests.add(chunkId)

							this.updateChunkGeometry(
								currX + oX,
								currY + oY,
								currZ + oZ
							).then((mesh) => {
								this.pendingChunkRequests.delete(chunkId)

								if (!mesh) return

								this.addLoadedMesh(chunkId, mesh)
								this.chunkUpdate.dispatch()
							})
						} else {
							this.addLoadedMesh(chunkId, mesh)
						}
					}
				}
			}
		}
	}

	protected addLoadedMesh(chunkId: string, mesh: Mesh) {
		this.scene.add(mesh)
		this.builtChunkMeshes.set(chunkId, mesh)
		this.loadedChunks.add(chunkId)
	}
	protected removeLoadedMesh(chunkId: string, deleteFromCache = false) {
		const mesh = this.builtChunkMeshes.get(chunkId)
		if (mesh) this.scene.remove(mesh)
		if (deleteFromCache) this.builtChunkMeshes.delete(chunkId)
		this.loadedChunks.delete(chunkId)
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
