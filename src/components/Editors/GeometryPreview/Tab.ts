import { Model } from 'bridge-model-viewer/lib/main'
import { App } from '/@/App'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import { ThreePreviewTab } from '../ThreePreview/ThreePreviewTab'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { RenderDataContainer } from './Data/RenderContainer'
import { DropdownWindow } from '/@/components/Windows/Common/Dropdown/DropdownWindow'
import { MultiOptionsWindow } from '/@/components/Windows/Common/MultiOptions/Window'
import Wintersky from 'wintersky'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { TabSystem } from '/@/components/TabSystem/TabSystem'

export interface IPreviewOptions {
	loadServerEntity?: boolean
}

export abstract class GeometryPreviewTab extends ThreePreviewTab {
	protected winterskyScene = new Wintersky.Scene({
		fetchTexture: async (config) => {
			const app = await App.getApp()

			try {
				return await loadAsDataURL(
					config.particle_texture_path,
					app.project.fileSystem
				)
			} catch (err) {
				// Fallback to Wintersky's default handling of textures
			}
		},
	})
	protected _renderContainer?: RenderDataContainer
	protected previewOptions: IPreviewOptions = {}

	constructor(
		tab: FileTab,
		tabSystem: TabSystem,
		fileHandle: FileSystemFileHandle
	) {
		super(tab, tabSystem, fileHandle)

		this.winterskyScene.global_options.loop_mode = 'once'
		this.winterskyScene.global_options.tick_rate = 60
		this.winterskyScene.global_options.max_emitter_particles = 1000
		this.winterskyScene.global_options.scale = 16
	}

	setPreviewOptions(previewOptions: IPreviewOptions) {
		this.previewOptions = previewOptions
	}

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

	abstract loadRenderContainer(): Promise<void>

	onDestroy() {
		this._renderContainer?.dispose()
		super.onDestroy()
	}

	protected async createModel() {
		const app = await App.getApp()

		if (this.model) this.scene?.remove(this.model.getGroup())
		this.scene.remove(this.winterskyScene.space)

		this.model = new Model(
			this.renderContainer.modelData,
			await loadAsDataURL(
				this.renderContainer.currentTexturePath,
				app.project.fileSystem
			)
		)

		this.scene.add(this.model.getGroup())

		this.model.animator.setupWintersky(this.winterskyScene)
		this.scene.add(this.winterskyScene.space)

		this.renderContainer.particles.forEach(([shortName, json]) => {
			if (!shortName) return

			this.model?.animator.addEmitter(
				shortName,
				new Wintersky.Config(this.winterskyScene, json)
			)
		})

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
