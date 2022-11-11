import type Wintersky from 'wintersky'
import type { Emitter, Config } from 'wintersky'
import { ThreePreviewTab } from '../ThreePreview/ThreePreviewTab'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import json5 from 'json5'
import { AxesHelper } from 'three'
import { FileWatcher } from '/@/components/FileSystem/FileWatcher'
import { ParticleWatcher } from './ParticleWatcher'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { FileTab } from '../../TabSystem/FileTab'
import { markRaw } from 'vue'
import { useWintersky } from '/@/utils/libs/useWintersky'

export class ParticlePreviewTab extends ThreePreviewTab {
	protected emitter?: Emitter
	protected config?: Config
	protected fileWatcher?: FileWatcher
	protected isReloadingDone = new Signal<void>()

	protected wintersky!: Wintersky.Scene

	constructor(tab: FileTab, tabSystem: TabSystem) {
		super(tab, tabSystem)

		this.setupComplete.once(() => {
			this.scene.add(new AxesHelper(16))
			this.wintersky.global_options.tick_rate = 60
			this.wintersky.global_options.max_emitter_particles = 1000
			this.wintersky.global_options.scale = 16

			// this.scene.add(new GridHelper(64, 64))
		})
		this.isReloadingDone.dispatch()
	}

	async setup() {
		const { default: Wintersky } = await useWintersky()

		this.wintersky = markRaw(
			new Wintersky.Scene({
				fetchTexture: async (config) => {
					const app = await App.getApp()
					const projectConfig = app.project.config

					try {
						return await loadAsDataURL(
							projectConfig.resolvePackPath(
								'resourcePack',
								`${config.particle_texture_path}.png`
							),
							app.fileSystem
						)
					} catch (err) {
						// Fallback to Wintersky's default handling of textures
					}
				},
			})
		)

		await super.setup()
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
				name: 'general.reload',
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
		if (!this.fileWatcher)
			this.fileWatcher = markRaw(
				new ParticleWatcher(this, this.tab.getPath())
			)
		if (!file)
			file =
				(await this.fileWatcher?.requestFile(await this.getFile())) ??
				(await this.getFile())

		let particle: any
		try {
			particle = json5.parse(await file.text())
		} catch {
			return
		}

		const { default: Wintersky } = await useWintersky()

		this.emitter?.delete()
		if (!this.scene.children.includes(this.wintersky.space))
			this.scene.add(this.wintersky.space)

		this.config = markRaw(
			new Wintersky.Config(this.wintersky, particle, {
				path: this.tab.getPath(),
			})
		)

		this.emitter = markRaw(
			new Wintersky.Emitter(this.wintersky, this.config, {
				loop_mode: 'looping',
				parent_mode: 'world',
			})
		)
		// console.log(this.scene)

		this.emitter.start()
	}

	protected render() {
		// console.log('loop')
		this.controls?.update()
		this.wintersky.updateFacingRotation(this.camera)
		this.emitter?.tick()

		this.renderer?.render(this.scene, this.camera)
		this.renderingRequested = false

		if (this.isActive) this.requestRendering()
	}

	async onChange(file?: File) {
		await this.isReloadingDone.fired
		this.isReloadingDone.resetSignal()

		await this.loadParticle(file)
		this.isReloadingDone.dispatch()
	}
	async close() {
		const didClose = await super.close()
		if (didClose) this.fileWatcher?.dispose()

		return didClose
	}

	async reload() {
		await this.onChange()
	}

	get icon() {
		return this.tab.icon
	}
	get iconColor() {
		return this.tab.iconColor
	}
}
