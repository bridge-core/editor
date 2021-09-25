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
import { IDisposable } from '/@/types/disposable'
import { IOutlineBox } from './Data/EntityData'
import { markRaw } from '@vue/composition-api'
import { Box3, Vector3, Color } from 'three'
import { saveOrDownload } from '/@/components/FileSystem/saveOrDownload'
import { StandaloneModelViewer } from 'bridge-model-viewer/lib/main'
import { wait } from '/@/utils/wait'

export abstract class GeometryPreviewTab extends ThreePreviewTab {
	protected winterskyScene = markRaw(
		Object.freeze(
			new Wintersky.Scene({
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
		)
	)
	protected model?: Model
	protected _renderContainer?: RenderDataContainer
	protected boxHelperDisposables: IDisposable[] = []

	constructor(tab: FileTab, tabSystem: TabSystem) {
		super(tab, tabSystem)

		this.winterskyScene.global_options.loop_mode = 'once'
		this.winterskyScene.global_options.tick_rate = 60
		this.winterskyScene.global_options.max_emitter_particles = 1000
		this.winterskyScene.global_options.scale = 16
		this.setupComplete.once(() => this.scene.add(this.winterskyScene.space))
	}

	get renderContainer() {
		if (!this._renderContainer)
			throw new Error(`Preview.renderContainer was not defined yet`)
		return this._renderContainer
	}

	get icon() {
		return 'mdi-cube-outline'
	}
	get iconColor() {
		return 'primary'
	}

	async onActivate() {
		await super.onActivate()
		this._renderContainer?.activate()
	}

	onCreate() {
		this.registerActions()
	}

	registerActions() {
		this.actions = []
		this.addAction(
			new SimpleAction({
				icon: 'mdi-refresh',
				name: 'general.reload',
				onTrigger: () => this.reload(),
			}),
			new SimpleAction({
				icon: 'mdi-image-outline',
				name: 'fileType.texture',
				isDisabled: () => {
					return (
						(this._renderContainer?.texturePaths?.length ?? 0) <= 1
					)
				},
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
				isDisabled: () => {
					return (
						(this._renderContainer?.geometryIdentifiers?.length ??
							0) <= 1
					)
				},
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
				isDisabled: () => {
					return (this._renderContainer?.animations?.length ?? 0) == 0
				},
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
			}),
			new SimpleAction({
				icon: 'mdi-collage',
				name: '[Asset Preview]',
				onTrigger: () => {
					this.renderAssetPreview()
				},
			})
		)
	}

	abstract loadRenderContainer(file: File): Promise<void>

	onDestroy() {
		this._renderContainer?.dispose()
		super.onDestroy()
	}
	onChange() {}

	protected async createModel() {
		if (!this._renderContainer) return

		const app = await App.getApp()

		if (this.model) {
			this.scene?.remove(this.model.getGroup())
			this.model.animator.disposeAnimations()
			this.boxHelperDisposables.forEach((disposable) =>
				disposable.dispose()
			)
		}
		this.registerActions()

		// No texture available for model -> nothing to render
		if (!this.renderContainer.currentTexturePath) return

		this.model = markRaw(
			new Model(
				this.renderContainer.modelData,
				await loadAsDataURL(
					this.renderContainer.currentTexturePath,
					app.project.fileSystem
				)
			)
		)
		await this.model.create()

		this.scene.add(this.model.getGroup())
		this.model.animator.setupWintersky(this.winterskyScene)

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

		const serverEntity = this.renderContainer.serverEntity
		if (serverEntity) {
			this.boxHelperDisposables.push()
			this.createOutlineBoxes([
				...serverEntity.getHitboxes(),
				...serverEntity.getCollisionBoxes(),
				...serverEntity.getSeatBoxHelpers(),
			])
		}

		this.requestRendering()
		setTimeout(() => {
			this.requestRendering()
		}, 100)
	}

	protected createOutlineBoxes(boxes: IOutlineBox[]) {
		this.boxHelperDisposables = boxes.map((box) =>
			this.model!.createOutlineBox(box.color, box.position, box.size)
		)
	}

	protected render(checkShouldTick = true) {
		this.winterskyScene.updateFacingRotation(this.camera)
		super.render()

		if (checkShouldTick && this.model && this.model.shouldTick) {
			this.model.tick()
			if (this.isActive) this.requestRendering()
		}
	}

	async close() {
		const didClose = await super.close()
		if (didClose) {
			this._renderContainer?.dispose()
			this._renderContainer = undefined
		}

		return didClose
	}

	async renderAssetPreview(scale = 1.5, res = 4, color = 0x121212) {
		const fileSystem = this.parent.project.fileSystem

		const modelCanvas = document.createElement('canvas')
		modelCanvas.width = 500
		modelCanvas.height = 500
		const modelViewer = new StandaloneModelViewer(
			modelCanvas,
			this.renderContainer.modelData,
			await fileSystem.loadFileHandleAsDataUrl(
				await fileSystem.getFileHandle(
					this.renderContainer.currentTexturePath
				)
			),
			{
				antialias: true,
				height: 500,
				width: 500,
			}
		)
		await modelViewer.loadedModel

		// @ts-ignore
		modelViewer.scene.background = new Color(color)

		const resultCanvas = document.createElement('canvas')
		resultCanvas.width = 1400 * res
		resultCanvas.height = 600 * res
		const resultCtx = resultCanvas.getContext('2d')
		if (!resultCtx) return

		resultCtx.imageSmoothingEnabled = false

		const model = modelViewer.getModel().getGroup()
		modelViewer.positionCamera(scale)

		modelViewer.requestRendering()
		await wait(100)

		const urls = []
		for (let i = 0; i < 5; i++) {
			if (i === 1) model.rotateY(Math.PI / 4)
			if (i !== 0) model.rotateY(Math.PI / 2)

			// @ts-ignore
			modelViewer.render(false)
			urls.push(modelCanvas.toDataURL('image/png'))
		}

		// Bottom
		const box = new Box3().setFromObject(model)
		const center = box.getCenter(new Vector3())
		model.position.setY(center.y)
		model.rotation.set(0.25 * Math.PI, 1.75 * Math.PI, 0.75 * Math.PI)
		modelViewer.positionCamera(scale, false)
		// @ts-ignore
		modelViewer.render(false)
		urls.push(modelCanvas.toDataURL('image/png'))
		model.position.setY(0)

		// Top
		model.rotation.set(0, 1.75 * Math.PI, 1.75 * Math.PI)
		modelViewer.positionCamera(scale, false)
		// @ts-ignore
		modelViewer.render(false)
		urls.push(modelCanvas.toDataURL('image/png'))

		const [
			entityTexture,
			/* gm1Logo, */ ...modelRenders
		] = await Promise.all([
			this.loadImageFromDisk(this.renderContainer.currentTexturePath),
			// this.loadImage('gm1.webp'),
			...urls.map((url) => this.loadImage(url)),
		])

		resultCtx.fillStyle = '#' + color.toString(16)
		resultCtx.fillRect(0, 0, resultCanvas.width, resultCanvas.height)
		resultCtx.drawImage(modelRenders[0], 0, 100 * res, 400 * res, 400 * res)

		for (let i = 0; i < 3; i++) {
			resultCtx.drawImage(
				modelRenders[i + 1],
				650 * res,
				i * 200 * res,
				200 * res,
				200 * res
			)
		}
		for (let i = 0; i < 3; i++) {
			resultCtx.drawImage(
				modelRenders[i + 4],
				1050 * res,
				i * 200 * res,
				200 * res,
				200 * res
			)
		}

		resultCtx.drawImage(
			entityTexture,
			400 * res,
			200 * res,
			200 * res,
			200 * res
		)
		// ctx.drawImage(
		// 	gm1Logo,
		// 	canvas.width - 50 * res,
		// 	canvas.height - 50 * res,
		// 	50 * res,
		// 	50 * res
		// )

		await new Promise<void>((resolve) => {
			resultCanvas.toBlob(async (blob) => {
				if (!blob) return

				await saveOrDownload(
					'previews/test.png',
					new Uint8Array(await blob.arrayBuffer()),
					this.parent.project.fileSystem
				)
				resolve()
			})
		})

		modelViewer.dispose()
	}

	protected loadImage(imageSrc: string) {
		return new Promise<HTMLImageElement>(async (resolve, reject) => {
			const image = new Image()
			image.addEventListener('load', () => resolve(image))

			image.src = imageSrc
		})
	}
	protected async loadImageFromDisk(imageSrc: string) {
		const fileSystem = this.parent.project.fileSystem

		return await this.loadImage(
			await fileSystem.loadFileHandleAsDataUrl(
				await fileSystem.getFileHandle(imageSrc)
			)
		)
	}
}
