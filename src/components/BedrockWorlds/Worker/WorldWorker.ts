// @ts-ignore Make "path" work on this worker
globalThis.process = {
	cwd: () => '',
	env: {},
}

import { expose } from 'comlink'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { WWProjectConfig } from './ProjectConfig'
import { LevelDB } from '../LevelDB/LevelDB'
import { join, dirname } from '/@/utils/path'
import { Chunk } from '../WorldFormat/Chunk'
import { toUint8Array } from '../LevelDB/Uint8ArrayUtils/ToUint8Array'
import { Block } from '../WorldFormat/Block'
import { BlockLibrary } from '../BlockLibrary/BlockLibrary'

export interface IWorldWorkerOptions {
	config: string
	worldPath: string
}

// TODO: Move world rendering logic into web worker to make rendering smoother & faster
export class WorldWorker {
	public readonly fileSystem: FileSystem
	public readonly config: WWProjectConfig

	protected _blockLibrary?: BlockLibrary
	protected _levelDb?: LevelDB
	protected chunks = new Map<string, Chunk>()

	constructor(
		baseDirectory: AnyDirectoryHandle,
		protected options: IWorldWorkerOptions
	) {
		this.fileSystem = new FileSystem(baseDirectory)
		this.config = new WWProjectConfig(this.fileSystem, options.config)
	}

	get levelDb() {
		if (!this._levelDb) throw new Error('LevelDB not initialized')
		return this._levelDb
	}
	get blockLibrary() {
		if (!this._blockLibrary)
			throw new Error('Block library not initialized')
		return this._blockLibrary
	}

	async open() {
		this._levelDb = new LevelDB(
			await this.fileSystem.getDirectoryHandle(
				join(this.options.worldPath, 'db')
			)
		)
		this._blockLibrary = new BlockLibrary(
			await this.fileSystem.getDirectoryHandle(
				dirname(this.options.config)
			)
		)

		await Promise.all([this.blockLibrary.setup(), this.levelDb.open()])

		console.log(this._blockLibrary)
	}

	getTileMap() {
		return this.blockLibrary.getTileMapAsImageBitmap()
	}

	getFromLevelDb(key: Uint8Array) {
		return this.levelDb.get(key)
	}

	getSubChunkAt(x: number, y: number, z: number) {
		const chunkX = toUint8Array(Math.floor(x / 16))
		const chunkZ = toUint8Array(Math.floor(z / 16))
		const chunkKey = new Uint8Array([...chunkX, ...chunkZ]).join(',')

		let chunk = this.chunks.get(chunkKey)
		if (!chunk) {
			chunk = new Chunk(this, chunkX, chunkZ)
			this.chunks.set(chunkKey, chunk)
		}

		return chunk.getSubChunk(Math.floor(y / 16))
	}
	getSubChunkDataAt(x: number, y: number, z: number) {
		const chunk = this.getSubChunkAt(x, y, z)
		return chunk.getGeometryData()
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
}

expose(WorldWorker, self)
