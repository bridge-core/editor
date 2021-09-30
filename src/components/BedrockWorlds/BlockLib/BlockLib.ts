import { AnyDirectoryHandle } from '../../FileSystem/Types'
import { FileSystem } from '../../FileSystem/FileSystem'

export class BlockLib {
	protected fileSystem: FileSystem

	constructor(baseDirectory: AnyDirectoryHandle) {
		this.fileSystem = new FileSystem(baseDirectory)
	}

	async loadBlocks() {
		const blocksJson = await this.fileSystem.readJSON('RP/blocks.json')
		const terrainTexture = await this.fileSystem.readJSON(
			'RP/texture/terrain_texture.json'
		)
	}
}
