import { Model } from 'bridge-model-viewer/lib/main'
import json5 from 'json5'
import { App } from '/@/App'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import { ThreePreviewTab } from '../ThreePreview/ThreePreviewTab'
import { SimpleAction } from '../../Actions/SimpleAction'
import { transformOldModels } from './transformOldModels'
import { RenderDataContainer } from './Data/RenderContainer'
import { DropdownWindow } from '../../Windows/Common/Dropdown/DropdownWindow'

export class GeometryPreviewTab extends ThreePreviewTab {
	protected _renderContainer?: RenderDataContainer

	get renderContainer() {
		if (!this._renderContainer)
			throw new Error(`Preview.renderContainer was not defined yet`)
		return this._renderContainer
	}
	async onActivate() {
		await super.onActivate()
		this._renderContainer?.activate()
	}

	onCreate() {
		this.addAction(
			new SimpleAction({
				icon: 'mdi-refresh',
				name: 'Reload',
				onTrigger: () => this.reload(),
			}),
			new SimpleAction({
				icon: 'mdi-image-outline',
				name: 'Texture',
				onTrigger: async () => {
					const textures = this.renderContainer.texturePaths
					const chooseTexture = new DropdownWindow({
						name: 'Texture',
						isClosable: false,
						options: textures,
						default: this.renderContainer.currentTexturePath,
					})
					const choice = await chooseTexture.fired

					this.renderContainer.selectTexturePath(choice)
					this.createModel()
				},
			}),
			new SimpleAction({
				icon: 'mdi-cube-outline',
				name: 'Model',
				onTrigger: async () => {
					const geomtries = this.renderContainer.geometryIdentifiers
					const chooseGeometry = new DropdownWindow({
						name: 'Geometry',
						isClosable: false,
						options: geomtries,
						default: geomtries[0],
					})
					const choice = await chooseGeometry.fired

					this.renderContainer.selectGeometry(choice)
					this.createModel()
				},
			}),
			new SimpleAction({
				icon: 'mdi-movie-open-outline',
				name: 'Animation',
				onTrigger: async () => {
					// TODO
				},
			})
		)
	}

	async loadRenderContainer() {
		if (this._renderContainer !== undefined) return
		const file = await this.getFile()
		await this.setupComplete
		const data = await file.text()
		const app = await App.getApp()

		let modelJson: any
		try {
			modelJson = transformOldModels(json5.parse(data))
		} catch {
			return
		}

		if (modelJson['minecraft:geometry'].length > 1) {
		} else if (modelJson['minecraft:geometry'].length === 1) {
			modelJson = modelJson['minecraft:geometry'][0]
		} else {
			return
		}

		const packIndexer = app.project.packIndexer.service
		if (!packIndexer) return

		const connectedClientEntities =
			(await packIndexer.find(
				'clientEntity',
				'geometryIdentifier',
				[modelJson.description.identifier],
				true
			)) ?? []

		const connectedBlocks =
			(await packIndexer.find(
				'block',
				'geometryIdentifier',
				[modelJson.description.identifier],
				true
			)) ?? []

		const clientEntityData = <Record<string, string[]>[]>(
			await Promise.all(
				connectedClientEntities.map((clientEntity) =>
					packIndexer.getCacheDataFor('clientEntity', clientEntity)
				)
			)
		)

		const connectedTextures = (
			await Promise.all(<Promise<string[]>[]>[
				...clientEntityData.map((data) => data.texturePath),
				...connectedBlocks.map((block) =>
					packIndexer.getCacheDataFor('block', block, 'texturePath')
				),
			])
		).flat()

		const connectedAnimations = (
			await Promise.all(<Promise<string[]>[]>[
				...clientEntityData.map((data) =>
					packIndexer.find(
						'clientAnimation',
						'identifier',
						data.animationIdentifier,
						true
					)
				),
			])
		).flat()

		this._renderContainer = new RenderDataContainer(app, {
			identifier: modelJson.description.identifer,
			texturePaths: connectedTextures,
		})
		this._renderContainer.createGeometry(this.tab.getProjectPath())
		for (const anim of connectedAnimations)
			this._renderContainer.createAnimation(anim)
		this._renderContainer.on(() => this.createModel())
	}

	async onChange() {
		await this.loadRenderContainer()

		if (this._renderContainer) {
			await this.renderContainer.ready
			await this.createModel()
		}
	}

	onDestroy() {
		this._renderContainer?.dispose()
	}

	protected async createModel() {
		const app = await App.getApp()

		if (this.model) this.scene?.remove(this.model.getModel())
		this.model = new Model(
			this.renderContainer.modelData,
			await loadAsDataURL(
				`RP/${this.renderContainer.currentTexturePath}`,
				app.project.fileSystem
			)
		)
		this.scene.add(this.model.getModel())

		for (const [animId, anim] of this.renderContainer.animations) {
			this.model.animator.addAnimation(animId, anim)
			if (animId === 'animation.bee.flying')
				this.model.animator.play(animId)
		}

		setTimeout(() => {
			this.requestRendering()
		}, 100)
	}
	async reload() {
		if (this.model) this.scene?.remove(this.model.getModel())
		this._renderContainer?.dispose()
		this._renderContainer = undefined
		await this.onChange()
	}

	get icon() {
		return 'mdi-cube-outline'
	}
	get iconColor() {
		return 'primary'
	}
}
