import type { TDirection } from '../../BlockLibrary/BlockLibrary'
import { SubChunk } from '../../WorldFormat/Chunk'
import { World } from '../../WorldFormat/World'
import { VoxelFaces } from '../VoxelFaces'
const chunkSize = 16

export class RenderSubChunk {
	constructor(protected world: World, protected subChunkInstance: SubChunk) {}

	/**
	 * TODO:
	 * This function is currently the big bottleneck of rendering worlds, needs optimizations
	 */
	getGeometryData() {
		if (this.subChunkInstance.blockLayers.length === 0) return
		const tileSize = 16
		const [
			tileTextureWidth,
			tileTextureHeight,
		] = this.world.blockLibrary.getTileMapSize()

		const positions: number[] = []
		const normals: number[] = []
		const uvs: number[] = []
		const indices: number[] = []
		const chunkX = this.subChunkInstance.parent.getX()
		const chunkY = this.subChunkInstance.y
		const chunkZ = this.subChunkInstance.parent.getZ()

		const startX = chunkX * chunkSize
		const startY = chunkY * chunkSize
		const startZ = chunkZ * chunkSize

		for (let y = 0; y < 16; y++) {
			for (let z = 0; z < 16; z++) {
				for (let x = 0; x < 16; x++) {
					const block = this.subChunkInstance
						.getLayer(0)
						.getBlockAt(x, y, z)

					// The current voxel is not air, we may need to render faces for it
					if (block.name !== 'minecraft:air') {
						x = chunkX < 0 ? chunkSize - x : x
						y = chunkY < 0 ? chunkSize - y : y
						z = chunkZ < 0 ? chunkSize - z : z

						// Do we need faces for the current voxel?
						for (const { dir, corners, faces } of VoxelFaces) {
							const neighbour = this.world.getBlockAt(
								0,
								startX + x + dir[0],
								startY + y + dir[1],
								startZ + z + dir[2]
							)

							// This voxel has a transparent voxel as a neighbour in the current direction -> add face
							if (
								neighbour.name === 'minecraft:air'
								// BlockLibrary.isTransparent(
								// 	neighbour,
								// 	(faces as unknown) as TDirection[]
								// ) ||
								// BlockLibrary.isSlab(voxel) ||
								// BlockLibrary.isFence(voxel) ||
								// BlockLibrary.isStairs(voxel)
							) {
								const ndx = positions.length / 3
								for (let {
									pos: [oX, oY, oZ],
									uv: [uvX, uvY],
								} of corners) {
									const [
										voxelUVX,
										voxelUVY,
									] = this.world.blockLibrary.getVoxelUv(
										block.name,
										(faces as unknown) as TDirection[]
									)
									// if (BlockLibrary.isSlab(voxel)) {
									// 	oY /= 2
									// 	uvY /= 2
									// } else if (BlockLibrary.isStairs(voxel)) {
									// 	oY /= 2
									// 	oX /= 2
									// 	uvY /= 2
									// 	uvX /= 2
									// } else if (BlockLibrary.isFence(voxel)) {
									// 	;(oX as number) =
									// 		oX === 0 ? 6 / 16 : 10 / 16
									// 	;(oZ as number) =
									// 		oZ === 0 ? 6 / 16 : 10 / 16
									// 	;(uvX as number) =
									// 		uvX === 0 ? 6 / 16 : 10 / 16
									// 	if (
									// 		((faces as unknown) as TDirection[]).includes(
									// 			'up'
									// 		) ||
									// 		((faces as unknown) as TDirection[]).includes(
									// 			'down'
									// 		)
									// 	)
									// 		(uvY as number) =
									// 			uvY === 0 ? 6 / 16 : 10 / 16
									// }
									positions.push(oX + x, oY + y, oZ + z)
									normals.push(...dir)
									uvs.push(
										((voxelUVX + uvX) * tileSize) /
											tileTextureWidth,
										1 -
											((voxelUVY + 1 - uvY) * tileSize) /
												tileTextureHeight
									)
								}
								indices.push(
									ndx,
									ndx + 1,
									ndx + 2,
									ndx + 2,
									ndx + 1,
									ndx + 3
								)
							}
						}
					}
				}
			}
		}

		return {
			positions,
			normals,
			uvs,
			indices,
		}
	}
}
