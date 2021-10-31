import { World } from '../WorldFormat/World'
import { ThreePreviewTab } from '/@/components/Editors/ThreePreview/ThreePreviewTab'

export class WorldTab extends ThreePreviewTab {
	protected world?: World
	onChange() {}
	reload() {}

	async onActivate() {
		const project = this.parent.project

		this.world = new World(
			await project.fileSystem.getDirectoryHandle('worlds/Chum M5/db'),
			project.fileSystem.baseDirectory,
			this.scene
		)

		await this.world.loadWorld()

		const chunk = this.world.getSubChunkAt(223, 63, 164)
		console.log(chunk)
	}

	render() {
		super.render()

		this.world?.updateCurrentMeshes(
			this.camera.position.x,
			this.camera.position.y,
			this.camera.position.z
		)
	}

	get name() {
		return 'World'
	}
	get iconColor() {
		return '#ffb400'
	}
	get icon() {
		return 'mdi-earth'
	}
}
