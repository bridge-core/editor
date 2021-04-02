import ModelViewerTabComponent from './ModelViewerTab.vue'
import { IDisposable } from '/@/types/disposable'
import { Model } from 'bridge-model-viewer/lib/main'
import { PreviewTab } from '/@/components/TabSystem/PreviewTab'
import {
	AmbientLight,
	Color,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from 'three'
import { Signal } from '/@/components/Common/Event/Signal'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import json5 from 'json5'
import { App } from '/@/App'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'

export class ModelViewerTab extends PreviewTab<string> {
	public component = ModelViewerTabComponent
	public readonly setupComplete = new Signal<void>()

	protected disposables: IDisposable[] = []
	protected model?: Model
	protected canvas?: HTMLCanvasElement
	protected renderer?: WebGLRenderer
	protected _camera?: PerspectiveCamera
	protected controls?: OrbitControls
	protected _scene?: Scene
	protected renderingRequested = false
	protected width: number = 0
	protected height: number = 0

	get scene() {
		if (!this._scene) throw new Error(`Scene is not defined yet`)
		return this._scene
	}
	get camera() {
		if (!this._camera) throw new Error(`Camera is not defined yet`)
		return this._camera
	}

	async receiveCanvas(canvas: HTMLCanvasElement) {
		const app = await App.getApp()

		this.canvas = canvas
		this.renderer = new WebGLRenderer({
			antialias: true,
			canvas,
		})
		this.renderer.setPixelRatio(window.devicePixelRatio)

		this._camera = new PerspectiveCamera(70, 2, 0.1, 1000)
		this._camera.position.x = -20
		this._camera.position.y = 20
		this._camera.position.z = -20

		this.camera.updateProjectionMatrix()
		this.controls = new OrbitControls(this.camera, canvas)
		this._scene = new Scene()
		this._scene.add(new AmbientLight(0xffffff))
		this._scene.background = new Color(
			app.themeManager.getColor('background')
		)

		this.disposables.push(app.windowResize.on(this.onResize.bind(this)))
		this.controls.addEventListener('change', () => this.requestRendering())

		this.onResize()
		this.setupComplete.dispatch()
	}
	async onActivate() {
		await super.onActivate()
		const app = await App.getApp()

		this.disposables.push(
			app.themeManager.on((mode) => {
				const background = app.themeManager.getColor('background')
				this.scene.background = new Color(background)
				this.requestRendering()
			})
		)
	}
	onDeactivate() {
		this.setupComplete.resetSignal()
		super.onDeactivate()
	}

	async onChange(data: string) {
		await this.setupComplete
		const app = await App.getApp()

		let modelJson: any
		try {
			modelJson = json5.parse(data)
		} catch {
			// TODO: Invalid JSON error message
			return
		}

		if (modelJson['minecraft:geometry']) {
			modelJson = modelJson['minecraft:geometry'][0]
		}

		if (this.model) this.scene?.remove(this.model.getModel())
		this.model = new Model(
			modelJson,
			await loadAsDataURL(
				'RP/textures/entity/marker.png',
				app.project.fileSystem
			)
		)
		this.scene.add(this.model.getModel())

		setTimeout(() => {
			this.requestRendering()
		}, 100)
	}

	protected render(checkShouldTick = true) {
		this.controls?.update()
		this.renderer?.render(this.scene, this.camera)
		this.renderingRequested = false

		if (checkShouldTick && this.model && this.model.shouldTick) {
			this.model.tick()
			this.requestRendering()
		}
	}

	requestRendering(immediate = false) {
		if (immediate) return this.render(false)

		if (this.renderingRequested) return

		this.renderingRequested = true
		requestAnimationFrame(() => this.render())
	}
	protected onResize() {
		const dimensions = this.canvas?.parentElement?.getBoundingClientRect()
		this.width = dimensions?.width ?? 0
		this.height = dimensions?.height ?? 0

		this.renderer?.setSize(this.width, this.height, true)
		if (this.camera) {
			this.camera.aspect = this.width / this.height
			this.camera.updateProjectionMatrix()
		}
		this.requestRendering()
	}
	protected async toOtherTabSystem(updateParentTabs?: boolean) {
		await super.toOtherTabSystem(updateParentTabs)

		this.onResize()
	}

	get icon() {
		return 'mdi-cube-outline'
	}
	get iconColor() {
		return 'primary'
	}
}
