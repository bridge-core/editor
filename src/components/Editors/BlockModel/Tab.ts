import { App } from '/@/App'
import { RenderDataContainer } from '../GeometryPreview/Data/RenderContainer'
import { GeometryPreviewTab } from '../GeometryPreview/Tab'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import json5 from 'json5'
import { FileWatcher } from '/@/components/FileSystem/FileWatcher'
import { findFileExtension } from '/@/components/FileSystem/FindFile'

export class BlockModelTab extends GeometryPreviewTab {
	protected blockWatcher = new FileWatcher(App.instance, this.blockFilePath)

	constructor(
		protected blockFilePath: string,
		tab: FileTab,
		parent: TabSystem,
		fileHandle: FileSystemFileHandle
	) {
		super(tab, parent, fileHandle)

		this.blockWatcher.on((file) => {
			this._renderContainer?.dispose()
			this._renderContainer = undefined
			this.loadRenderContainer(file)
		})
	}

	async loadRenderContainer(file: File) {
		if (this._renderContainer !== undefined) return
		await this.setupComplete
		const app = await App.getApp()

		const packIndexer = app.project.packIndexer.service
		if (!packIndexer) return

		let blockJson: any
		try {
			blockJson =
				json5.parse(await file.text())?.['minecraft:block'] ?? {}
		} catch {
			return
		}

		const blockCacheData = await packIndexer.getCacheDataFor(
			'block',
			this.blockFilePath
		)

		const textureReferences: string[] = blockCacheData.texture
		let terrainTexture: any
		try {
			terrainTexture =
				json5.parse(
					await app.project
						.getFileFromDiskOrTab(
							'RP/textures/terrain_texture.json'
						)
						.then((file) => file.text())
				)?.['texture_data'] ?? {}
		} catch {
			return
		}
		const connectedTextures = await Promise.all(
			textureReferences
				.map((ref) => terrainTexture[ref]?.textures ?? [])
				.flat()
				.map((texturePath) =>
					findFileExtension(
						app.project.fileSystem,
						`RP/${texturePath}`,
						['.tga', '.png', '.jpg', '.jpeg']
					)
				)
		)

		const connectedGeometries = await packIndexer.find(
			'geometry',
			'identifier',
			blockCacheData.geometryIdentifier ?? []
		)

		this._renderContainer = new RenderDataContainer(app, {
			identifier: blockCacheData.geometryIdentifier[0],
			texturePaths: <string[]>(
				connectedTextures.filter(
					(texturePath) => texturePath !== undefined
				)
			),
			connectedAnimations: new Set([]),
		})
		this._renderContainer.createGeometry(connectedGeometries[0])

		// Once the renderContainer is ready loading, create the initial model...
		this.renderContainer.ready.then(() => {
			this.createModel()
		})
		// ...and listen to further changes to the files for hot-reloading
		this._renderContainer.on(() => {
			this.createModel()
		})
	}
}
