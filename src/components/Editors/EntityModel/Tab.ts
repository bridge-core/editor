import json5 from 'json5'
import { App } from '/@/App'
import { transformOldModels } from './transformOldModels'
import { RenderDataContainer } from '../GeometryPreview/Data/RenderContainer'
import { GeometryPreviewTab } from '../GeometryPreview/Tab'
import { FileTab } from '../../TabSystem/FileTab'
import { TabSystem } from '../../TabSystem/TabSystem'

export class EntityModelTab extends GeometryPreviewTab {
	constructor(
		protected clientEntityFilePath: string,
		tab: FileTab,
		parent: TabSystem,
		fileHandle: FileSystemFileHandle
	) {
		super(tab, parent, fileHandle)
	}

	async loadRenderContainer() {
		if (this._renderContainer !== undefined) return
		await this.setupComplete
		const app = await App.getApp()

		const packIndexer = app.project.packIndexer.service
		if (!packIndexer) return

		const clientEntityData = await packIndexer.getCacheDataFor(
			'clientEntity',
			this.clientEntityFilePath
		)
		console.log(clientEntityData)

		const connectedTextures = clientEntityData.texturePath

		const connectedAnimations = await packIndexer.find(
			'clientAnimation',
			'identifier',
			clientEntityData.animationIdentifier ?? [],
			true
		)
		const connectedGeometries = await packIndexer.find(
			'geometry',
			'identifier',
			clientEntityData.geometryIdentifier ?? []
		)
		const connectedParticles = await packIndexer.find(
			'particle',
			'identifier',
			clientEntityData.particleIdentifier ?? [],
			true
		)
		console.log(connectedParticles)

		this._renderContainer = new RenderDataContainer(app, {
			identifier: clientEntityData.geometryIdentifier[0],
			texturePaths: connectedTextures,
			connectedAnimations: new Set(clientEntityData.animationIdentifier),
		})
		this._renderContainer.createGeometry(connectedGeometries[0])

		connectedAnimations.forEach((filePath) =>
			this._renderContainer!.createAnimation(filePath)
		)
		connectedParticles.forEach((filePath, i) =>
			this._renderContainer!.createParticle(
				(clientEntityData?.particleReference ?? [])[i],
				filePath
			)
		)
		console.log(this.renderContainer!.particles)

		// Once the renderContainer is ready loading, create the initial model...
		this.renderContainer.ready.then(() => {
			this.createModel()
		})
		// ...and listen to further changes to the files for hot-reloading
		this._renderContainer.on(() => {
			this.createModel()
		})
	}
}
