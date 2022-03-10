import { markRaw } from '@vue/composition-api'
import { throttle } from 'lodash-es'
import { AnyDirectoryHandle } from '../../FileSystem/Types'
import { TabSystem } from '../../TabSystem/TabSystem'
import { World } from '../WorldFormat/World'
import { ThreePreviewTab } from '/@/components/Editors/ThreePreview/ThreePreviewTab'

export class WorldTab extends ThreePreviewTab {
	protected world?: World
	onChange() {}
	reload() {}

	constructor(
		protected worldHandle: AnyDirectoryHandle,
		tabSystem: TabSystem
	) {
		super(undefined, tabSystem)
	}

	async onActivate() {
		const project = this.parent.project
		await super.onActivate()

		this.addHelpers()

		this.world = markRaw(
			new World(
				this.parent.app.fileSystem.baseDirectory,
				this.worldHandle,
				project.fileSystem.baseDirectory,
				this.scene
			)
		)

		const { playerPosition, playerRotation } = await this.world.loadWorld()

		this.world.chunkUpdate.on(
			throttle(() => this.requestRendering(false, false), 500)
		)

		// this.controls?.addEventListener('change', () => {
		// 	console.log(this.camera.position)
		// })

		this.camera.position.set(...playerPosition)
		if (playerRotation) this.camera.rotation.set(...playerRotation, 0)
	}
	onDeactivate(): void {
		this.world?.dispose()
		this.world = undefined
	}

	render(updateMeshes = true) {
		console.log('RENDER')
		super.render()

		if (updateMeshes)
			this.world?.updateCurrentMeshes(
				this.camera.position.x,
				this.camera.position.y,
				this.camera.position.z
			)
	}
	requestRendering(immediate = false, updateMeshes = true) {
		if (immediate) return this.render()

		if (this.renderingRequested) return

		this.renderingRequested = true
		requestAnimationFrame(() => this.render(updateMeshes))
	}

	get name() {
		return this.worldHandle.name
	}
	get iconColor() {
		return 'worlds'
	}
	get icon() {
		return 'mdi-earth-box'
	}
}
