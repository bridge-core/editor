import Wintersky from 'wintersky'
import { ThreePreviewTab } from '../ThreePreview/ThreePreviewTab'
import { SimpleAction } from '../../Actions/SimpleAction'
import json5 from 'json5'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import { App } from '/@/App'
import { AxesHelper, GridHelper, Object3D } from 'three'
import { FileWatcher } from '/@/components/Editors/GeometryPreview/Data/FileWatcher'
import { ParticleWatcher } from './ParticleWatcher'

export class ParticlePreviewTab extends ThreePreviewTab<string> {
	protected emitter?: Wintersky.Emitter
	protected config?: Wintersky.Config
	protected fileWatcher?: FileWatcher
	protected wasDestroyed = false

	async onActivate() {
		// @ts-ignore
		Wintersky.fetchTexture = async (config) => {
			const app = await App.getApp()

			return await loadAsDataURL(
				// @ts-ignore
				`RP/${config.particle_texture_path}.png`,
				app.project.fileSystem
			)
		}

		await super.onActivate()
	}
	onDestroy() {
		this.fileWatcher?.dispose()
		this.emitter?.stop(true)
		this.wasDestroyed = true
	}

	onCreate() {
		this.addAction(
			new SimpleAction({
				icon: 'mdi-refresh',
				name: 'Reload',
				onTrigger: () => this.reload(),
			})
		)
	}
	async receiveCanvas(canvas: HTMLCanvasElement) {
		const shouldSetPosition = !this._camera
		await super.receiveCanvas(canvas)
		if (shouldSetPosition) this.camera.position.set(6, 3, 6)
	}

	async loadParticle(file?: File) {
		if (!file) file = await this.getFile()
		if (!this.fileWatcher) this.fileWatcher = new ParticleWatcher(this)

		let particle: any
		try {
			particle = json5.parse(await file.text())
		} catch {
			return
		}

		if (this.emitter) {
			this.emitter?.delete()
			// @ts-ignore
			this.scene.remove(Wintersky.space)
			// @ts-ignore
			Wintersky.space = new Object3D()
		}
		this.config = new Wintersky.Config({}, { path: this.getProjectPath() })
		this.config.setFromJSON(particle)

		this.emitter = new Wintersky.Emitter(this.config, {
			loop_mode: 'looping',
			parent_mode: 'world',
		})
		// @ts-ignore
		this.scene.add(Wintersky.space)
		this.scene.add(new AxesHelper(1))
		// this.scene.add(new GridHelper(64, 64))
		this.emitter.start()
	}

	protected render(checkShouldTick = true) {
		this.controls?.update()
		this.renderer?.render(this.scene, this.camera)
		this.renderingRequested = false

		Wintersky.updateFacingRotation(this.camera)
		this.emitter?.tick()

		if (!this.wasDestroyed) this.requestRendering()
	}

	async onChange(file?: File) {
		this.loadParticle(file)
	}

	async reload() {
		// TODO: Reload particle
		await this.onChange()
	}

	get icon() {
		return 'mdi-cube-outline'
	}
	get iconColor() {
		return 'primary'
	}
}
