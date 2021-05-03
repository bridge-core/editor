import { Model } from 'bridge-model-viewer/lib/main'
import json5 from 'json5'
import { App } from '/@/App'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import { ThreePreviewTab } from '../ThreePreview/ThreePreviewTab'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { transformOldModels } from './transformOldModels'
import { RenderDataContainer } from './Data/RenderContainer'
import { DropdownWindow } from '/@/components/Windows/Common/Dropdown/DropdownWindow'
import { MultiOptionsWindow } from '/@/components/Windows/Common/MultiOptions/Window'

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
				name: 'general.reload',
				onTrigger: () => this.reload(),
			}),
			new SimpleAction({
				icon: 'mdi-image-outline',
				name: 'fileType.texture',
				onTrigger: async () => {
					const textures = this.renderContainer.texturePaths
					const chooseTexture = new DropdownWindow({
						name: 'fileType.texture',
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
				name: 'fileType.geometry',
				onTrigger: async () => {
					const geomtries = this.renderContainer.geometryIdentifiers
					const chooseGeometry = new DropdownWindow({
						name: 'fileType.geometry',
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
				name: 'fileType.clientAnimation',
				onTrigger: async () => {
					const animations = this.renderContainer.animations
					const chooseAnimation = new MultiOptionsWindow({
						name: 'fileType.clientAnimation',
						options: animations.map(([animId]) => ({
							name: animId,
							isSelected: this.renderContainer.runningAnimations.has(
								animId
							),
						})),
					})
					const choices = await chooseAnimation.fired

					this.model?.animator.pauseAll()
					this.renderContainer.runningAnimations.clear()
					choices.forEach((choice) => {
						this.renderContainer.runningAnimations.add(choice)
					})
					this.createModel()
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

		// No connected files found
		if (!connectedClientEntities || connectedClientEntities.length === 0)
			return

		const clientEntityData = <Record<string, string[]>[]>(
			await Promise.all(
				connectedClientEntities.map((clientEntity) =>
					packIndexer.getCacheDataFor('clientEntity', clientEntity)
				)
			)
		)

		const connectedTextures = clientEntityData
			.map((data) => data.texturePath)
			.flat()

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
			connectedAnimations: new Set(
				clientEntityData
					.map((data) => data.animationIdentifier)
					.filter((data) => data !== undefined)
					.flat()
			),
		})
		this._renderContainer.createGeometry(this.tab.getProjectPath())

		for (const anim of connectedAnimations) {
			this._renderContainer.createAnimation(anim)
		}

		// Once the renderContainer is ready loading, create the initial model...
		this.renderContainer.ready.then(() => {
			this.createModel()
		})
		// ...and listen to further changes to the files for hot-reloading
		this._renderContainer.on(() => {
			this.createModel()
		})
	}

	onDestroy() {
		this._renderContainer?.dispose()
		super.onDestroy()
	}

	protected async createModel() {
		const app = await App.getApp()

		if (this.model) this.scene?.remove(this.model.getGroup())
		// @ts-ignore
		console.log(this.renderContainer, this.renderContainer._geometries)
		this.model = new Model(
			this.renderContainer.modelData,
			await loadAsDataURL(
				this.renderContainer.currentTexturePath,
				app.project.fileSystem
			)
		)
		this.scene.add(this.model.getGroup())

		for (const [animId, anim] of this.renderContainer.animations) {
			this.model.animator.addAnimation(animId, anim)
		}
		this.renderContainer.runningAnimations.forEach((animId) =>
			this.model?.animator.play(animId)
		)

		setTimeout(() => {
			this.requestRendering()
		}, 100)
	}

	async onChange() {
		await this.loadRenderContainer()
	}
	async reload() {
		if (this.model) this.scene?.remove(this.model.getGroup())
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
