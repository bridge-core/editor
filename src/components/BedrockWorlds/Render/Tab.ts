import { markRaw } from '@vue/composition-api'
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

		this.world = markRaw(
			new World(
				this.parent.app.fileSystem.baseDirectory,
				this.worldHandle,
				project.fileSystem.baseDirectory,
				this.scene
			)
		)

		const { playerPosition, playerRotation } = await this.world.loadWorld()
		setTimeout(() => this.requestRendering(), 300)

		// this.controls?.addEventListener('change', () => {
		// 	console.log(this.camera.position)
		// })

		this.addHelpers()

		this.camera.position.set(...playerPosition)
		if (playerRotation) this.camera.rotation.set(...playerRotation, 0)
	}

	render() {
		console.log('RENDER')
		this.world?.updateCurrentMeshes(
			this.camera.position.x,
			this.camera.position.y,
			this.camera.position.z
		)
		// .then(() => super.render())

		super.render()
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
