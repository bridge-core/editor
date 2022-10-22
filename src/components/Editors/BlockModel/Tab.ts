import { App } from '/@/App'
import { RenderDataContainer } from '../GeometryPreview/Data/RenderContainer'
import { GeometryPreviewTab } from '../GeometryPreview/Tab'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import json5 from 'json5'
import { FileWatcher } from '/@/components/FileSystem/FileWatcher'
import { findFileExtension } from '/@/components/FileSystem/FindFile'
import { walkObject } from 'bridge-common-utils'
import { isValidPositionArray } from '/@/utils/minecraft/validPositionArray'
import { markRaw } from 'vue'
import { IOutlineBox } from '../GeometryPreview/Data/EntityData'
import { compare as compareVersions } from 'compare-versions'

export interface IBlockPreviewOptions {
	loadComponents?: boolean
}

const collisionComponents = {
	'1.16.100': [
		{ name: 'minecraft:entity_collision', color: '#ffff00' },
		{ name: 'minecraft:pick_collision', color: '#0000ff' },
	],
	// Our auto-completions version this name change as '1.18.10' but the formatVersionCorrection plugin changes it to 1.18.0
	'1.18.0': [
		{ name: 'minecraft:block_collision', color: '#ffff00' },
		{ name: 'minecraft:aim_collision', color: '#0000ff' },
	],
	'1.19.10': [
		{ name: 'minecraft:collision_box', color: '#ffff00' },
		{ name: 'minecraft:aim_collision', color: '#0000ff' },
	],
}
function loadCollisionComponents(formatVersion = '1.16.100') {
	for (const [currFormatVersion, components] of Object.entries(
		collisionComponents
	)) {
		if (compareVersions(currFormatVersion, formatVersion, '<')) continue

		return components
	}
}

export class BlockModelTab extends GeometryPreviewTab {
	protected blockWatcher: FileWatcher
	protected blockJson: any = {}
	protected formatVersion = '1.16.100'
	protected previewOptions: IBlockPreviewOptions = {}

	constructor(
		protected blockFilePath: string,
		tab: FileTab,
		parent: TabSystem
	) {
		super(tab, parent)

		this.blockWatcher = new FileWatcher(App.instance, blockFilePath)

		this.blockWatcher.on((file) => this.reload(file))
	}

	setPreviewOptions({ loadComponents = true }: IBlockPreviewOptions) {
		this.previewOptions = {
			loadComponents,
		}
	}

	async close() {
		const didClose = await super.close()
		if (didClose) this.blockWatcher.dispose()

		return didClose
	}
	async reload(file?: File) {
		if (!file) file = await this.blockWatcher.getFile()

		this._renderContainer?.dispose()
		this._renderContainer = undefined
		this.loadRenderContainer(file)
	}

	async loadRenderContainer(file: File) {
		if (this._renderContainer !== undefined) return
		await this.setupComplete
		const app = await App.getApp()

		await app.project.packIndexer.fired
		const packIndexer = app.project.packIndexer.service
		const config = app.project.config
		if (!packIndexer) return

		let rawJsonData: any = undefined
		try {
			rawJsonData = json5.parse(await file.text())
		} catch (err) {
			console.error(`Invalid JSON within block file`)
			return
		}

		this.blockJson = markRaw(rawJsonData?.['minecraft:block'] ?? {})
		this.formatVersion = rawJsonData?.format_version ?? '1.16.100'

		const blockCacheData = await packIndexer.getCacheDataFor(
			'block',
			this.blockFilePath
		)

		const textureReferences: string[] = blockCacheData?.texture ?? []
		let terrainTexture: any
		try {
			terrainTexture =
				json5.parse(
					await app.project
						.getFileFromDiskOrTab(
							config.resolvePackPath(
								'resourcePack',
								'textures/terrain_texture.json'
							)
						)
						.then((file) => file.text())
				)?.['texture_data'] ?? {}
		} catch (err) {
			console.error(`Invalid JSON within terrain_texture.json file`)
			return
		}
		const connectedTextures = await Promise.all(
			textureReferences
				.map((ref) => terrainTexture[ref]?.textures ?? [])
				.flat()
				.map((texturePath) =>
					findFileExtension(
						app.fileSystem,
						config.resolvePackPath('resourcePack', texturePath),
						['.tga', '.png', '.jpg', '.jpeg']
					)
				)
		)
		if (connectedTextures.length === 0) return

		const connectedGeometries = await packIndexer.find(
			'geometry',
			'identifier',
			blockCacheData.geometryIdentifier ?? []
		)
		if (connectedGeometries.length === 0) return

		this._renderContainer = markRaw(
			new RenderDataContainer(app, {
				identifier: blockCacheData.geometryIdentifier[0],
				texturePaths: <string[]>(
					connectedTextures.filter(
						(texturePath) => texturePath !== undefined
					)
				),
				connectedAnimations: new Set([]),
			})
		)
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

	async createModel() {
		await super.createModel()

		if (this.previewOptions.loadComponents) {
			const collisionComponents =
				loadCollisionComponents(this.formatVersion) ?? []
			const outlineBoxes = collisionComponents
				.map(({ name, color }) => this.loadCollisionBoxes(name, color))
				.flat()

			this.createOutlineBoxes(outlineBoxes)
		}
	}

	findComponents(blockJson: any, id: string) {
		const components: any[] = []
		const onReach = (data: any) => components.push(data)
		const locations = [
			`components/${id}`,
			`permutations/*/components/${id}`,
		]
		locations.forEach((loc) => walkObject(loc, blockJson, onReach))

		return components
	}
	loadCollisionBoxes(componentName: string, color: string) {
		return this.findComponents(this.blockJson, componentName)
			.filter(
				(collisionBox) =>
					isValidPositionArray(collisionBox.origin) &&
					isValidPositionArray(collisionBox.size)
			)
			.map(
				({ origin, size }) =>
					<IOutlineBox>{
						color,
						position: {
							x: origin[0] + size[0] / 2,
							y: origin[1],
							z: origin[2] + size[2] / 2,
						},
						size: { x: size[0], y: size[1], z: size[2] },
					}
			)
	}
}
