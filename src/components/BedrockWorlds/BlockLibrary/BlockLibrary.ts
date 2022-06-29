import { AnyDirectoryHandle } from '../../FileSystem/Types'
import { FileSystem } from '../../FileSystem/FileSystem'
import { DataLoader } from '../../Data/DataLoader'
import { loadImage } from './loadImage'
import { toBlob } from '/@/utils/canvasToBlob'

export type TDirection =
	| 'up'
	| 'down'
	| 'north'
	| 'west'
	| 'east'
	| 'south'
	| 'side'
	| 'all'

interface IBlockLibEntry {
	faces: {
		[key in TDirection]?: {
			uvOffset?: [number, number]
			texturePath: string
			overlayColor?: [number, number, number]
		}
	}
}

export class BlockLibrary {
	protected fileSystem: FileSystem
	protected dataLoader: DataLoader
	protected _missingTexture?: ImageBitmap
	protected _tileMap?: HTMLCanvasElement

	get missingTexture() {
		if (!this._missingTexture)
			throw new Error(
				`Trying to access missingTexture before BlockLibrary was setup`
			)
		return this._missingTexture
	}
	get tileMap() {
		if (!this._tileMap)
			throw new Error('Trying to access tileMap before it was created')
		return this._tileMap
	}

	protected library = new Map<string, IBlockLibEntry>()

	constructor(baseDirectory: AnyDirectoryHandle) {
		this.fileSystem = new FileSystem(baseDirectory)
		this.dataLoader = new DataLoader()
	}

	async setup() {
		if (!this.dataLoader.hasFired) await this.dataLoader.loadData()

		this._missingTexture = await createImageBitmap(
			await this.dataLoader.readFile(
				'data/packages/minecraftBedrock/vanilla/missing_tile.png'
			)
		)

		const blocksJson = Object.assign(
			await this.dataLoader.readJSON(
				'data/packages/minecraftBedrock/vanilla/blocks.json'
			),
			await this.fileSystem.readJSON('RP/blocks.json')
		)
		const terrainTexture = Object.assign(
			(
				await this.dataLoader.readJSON(
					'data/packages/minecraftBedrock/vanilla/terrain_texture.json'
				)
			).texture_data,
			(await this.fileSystem.readJSON('RP/textures/terrain_texture.json'))
				.texture_data
		)
		console.log(terrainTexture)

		for (let id in blocksJson) {
			const { textures } = blocksJson[id]

			// Normalize identifiers to make sure they include a namespace
			if (id.indexOf(':') === -1) id = `minecraft:${id}`

			if (typeof textures === 'string')
				this.library.set(id, {
					faces: {
						all: {
							texturePath: `RP/${this.chooseTexture(
								terrainTexture[textures]
							)}`,
						},
					},
				})
			else if (typeof textures === 'object') {
				const entry: IBlockLibEntry = { faces: {} }

				for (let direction in textures) {
					const textureLookup = textures[direction]

					entry.faces[direction as TDirection] = {
						texturePath: `RP/${this.chooseTexture(
							terrainTexture[textureLookup]
						)}`,
					}
				}

				this.library.set(id, entry)
			}
		}

		console.log(this.library)

		return await this.createTileMap()
	}

	protected chooseTexture(textureData: {
		textures:
			| string
			| (
					| string
					| {
							path?: string
							variations?: { path: string; weight: number }[]
					  }
			  )[]
			| { path?: string; variations?: { path: string; weight: number }[] }
	}) {
		let { textures } = textureData

		if (Array.isArray(textures)) textures = textures[0]

		if (typeof textures === 'string') return textures
		else if (typeof textures === 'object')
			return textures.variations?.[0]?.path ?? textures.path
	}

	protected async createTileMap() {
		const canvas = document.createElement('canvas')
		const rowLength = Math.ceil(Math.sqrt(this.library.size * 8))
		canvas.width = rowLength * 16
		canvas.height = canvas.width
		const context = canvas.getContext('2d')
		if (!context) throw new Error(`Failed to initialize canvas 2d context`)

		context.imageSmoothingEnabled = false

		let currentUVOffset = 0
		for (const blockData of this.library.values()) {
			for (const [dir, { texturePath, overlayColor }] of Object.entries(
				blockData.faces
			)) {
				const x = currentUVOffset % rowLength
				const y = Math.floor(currentUVOffset / rowLength)
				const image =
					(await loadImage(this.fileSystem, texturePath)) ??
					this.missingTexture
				context.drawImage(image, x * 16, y * 16, 16, 16)

				blockData.faces[dir as TDirection] = {
					...blockData.faces[dir as TDirection],
					uvOffset: [x, y],
					texturePath: blockData.faces[dir as TDirection]
						?.texturePath!,
				}
				currentUVOffset++
			}
		}

		await this.fileSystem.writeFile(
			'.bridge/bedrockWorld/uvMap.png',
			await toBlob(canvas)
		)

		this._tileMap = canvas

		return canvas
	}

	getTileMapSize() {
		return <const>[this.tileMap.width, this.tileMap.height]
	}
	getVoxelUv(identifier: string, faces: TDirection[]) {
		const entry = this.library.get(identifier)
		if (!entry) return [0, 0]

		for (let face of faces) {
			if (entry.faces[face] !== undefined)
				return entry.faces[face]!.uvOffset!
		}

		if (entry.faces.all) return entry.faces.all.uvOffset!

		return [0, 0]
	}
}
