import Wintersky, { Emitter, Config } from 'wintersky'
import { ThreePreviewTab } from '../ThreePreview/ThreePreviewTab'
import { SimpleAction } from '../../Actions/SimpleAction'
import json5 from 'json5'
import { AxesHelper, GridHelper, Object3D } from 'three'
import { FileWatcher } from '/@/components/Editors/GeometryPreview/Data/FileWatcher'
import { ParticleWatcher } from './ParticleWatcher'
import { Tab } from '../../TabSystem/CommonTab'
import { TabSystem } from '../../TabSystem/TabSystem'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import { App } from '/@/App'

export class ParticlePreviewTab extends ThreePreviewTab {
	protected emitter?: Emitter
	protected config?: Config
	protected fileWatcher?: FileWatcher

	protected wintersky = new Wintersky({
		fetchTexture: async (config) => {
			const app = await App.getApp()

			return await loadAsDataURL(
				// @ts-ignore
				`RP/${config.particle_texture_path}.png`,
				app.project.fileSystem
			)
		},
	})

	constructor(
		tab: Tab,
		tabSystem: TabSystem,
		fileHandle: FileSystemFileHandle
	) {
		super(tab, tabSystem, fileHandle)

		this.setupComplete.once(() => {
			this.scene.add(new AxesHelper(16))
			this.wintersky.global_options.tick_rate = 60
			this.wintersky.global_options.max_emitter_particles = 1000
			this.wintersky.global_options.scale = 16
			// this.scene.add(new GridHelper(64, 64))
		})
	}

	async onActivate() {
		await super.onActivate()
		await this.onChange()
	}
	onDeactivate() {
		this.emitter?.stop(true)

		super.onDeactivate()
	}
	onDestroy() {
		this.fileWatcher?.dispose()
		this.emitter?.delete()
		super.onDestroy()
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
		if (shouldSetPosition) this.camera.position.set(60, 30, 60)
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

		this.emitter?.delete()
		// @ts-ignore
		this.scene.remove(this.wintersky.space)

		this.config = new Wintersky.Config(this.wintersky, particle, {
			path: this.getProjectPath(),
		})

		this.emitter = new Wintersky.Emitter(this.wintersky, this.config, {
			loop_mode: 'looping',
			parent_mode: 'world',
		})

		// @ts-ignore
		this.scene.add(this.wintersky.space)
		this.emitter.start()
	}

	protected render() {
		this.controls?.update()
		this.wintersky.updateFacingRotation(this.camera)
		this.emitter?.tick()

		this.renderer?.render(this.scene, this.camera)
		this.renderingRequested = false

		if (this.isActive) this.requestRendering()
	}

	async onChange(file?: File) {
		await this.loadParticle(file)
	}

	async reload() {
		await this.onChange()
	}

	get icon() {
		return 'mdi-cube-outline'
	}
	get iconColor() {
		return 'primary'
	}
}
