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
		await super.onActivate()
		const project = this.parent.project

		this.world = markRaw(
			new World(
				await this.worldHandle.getDirectoryHandle('db'),
				project.fileSystem.baseDirectory,
				this.scene
			)
		)

		await this.world.loadWorld()
		this.requestRendering()

		console.log(this.world.blockLibrary, this)
	}

	async render() {
		super.render()

		await this.world?.updateCurrentMeshes(
			this.camera.position.x,
			this.camera.position.y,
			this.camera.position.z
		)
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
