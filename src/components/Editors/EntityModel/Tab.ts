import { App } from '/@/App'
import { RenderDataContainer } from '../GeometryPreview/Data/RenderContainer'
import { GeometryPreviewTab } from '../GeometryPreview/Tab'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import json5 from 'json5'
import { FileWatcher } from '/@/components/FileSystem/FileWatcher'
import { InformationWindow } from '../../Windows/Common/Information/InformationWindow'
import { markRaw } from '@vue/composition-api'

export interface IPreviewOptions {
	loadServerEntity?: boolean
}

export class EntityModelTab extends GeometryPreviewTab {
	protected previewOptions: IPreviewOptions = {}
	protected clientEntityWatcher: FileWatcher

	constructor(
		protected clientEntityFilePath: string,
		tab: FileTab,
		parent: TabSystem
	) {
		super(tab, parent)

		this.clientEntityWatcher = new FileWatcher(
			App.instance,
			clientEntityFilePath
		)

		this.clientEntityWatcher.on((file) => {
			const runningAnims = this._renderContainer?.runningAnimations

			this._renderContainer?.dispose()
			this._renderContainer = undefined
			this.loadRenderContainer(file, runningAnims)
		})
	}
	setPreviewOptions(previewOptions: IPreviewOptions) {
		this.previewOptions = previewOptions
	}

	async close() {
		const didClose = await super.close()
		if (didClose) this.clientEntityWatcher.dispose()

		return didClose
	}

	async loadRenderContainer(file: File, runningAnims = new Set<string>()) {
		if (this._renderContainer !== undefined) return
		await this.setupComplete
		const app = await App.getApp()

		const packIndexer = app.project.packIndexer.service
		if (!packIndexer) return

		let clientEntity: any
		try {
			clientEntity =
				json5.parse(await file.text())?.['minecraft:client_entity'] ??
				{}
		} catch {
			return
		}

		const clientEntityData = await packIndexer.getCacheDataFor(
			'clientEntity',
			this.clientEntityFilePath
		)

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
		if (connectedGeometries.length === 0) {
			new InformationWindow({ description: 'preview.noGeometry' })
			this.close()
			return
		}

		const connectedParticles = await Promise.all(
			Object.entries<string>(
				clientEntity?.description?.particle_effects ?? {}
			).map(async ([shortName, particleId]) => {
				return <const>[
					shortName,
					(
						await packIndexer.find(
							'particle',
							'identifier',
							[particleId],
							false
						)
					)[0],
				]
			})
		)

		this._renderContainer = markRaw(
			new RenderDataContainer(app, {
				identifier: clientEntityData.geometryIdentifier[0],
				texturePaths: connectedTextures,
				connectedAnimations: new Set(
					clientEntityData.animationIdentifier
				),
			})
		)
		this._renderContainer.createGeometry(connectedGeometries[0])

		connectedAnimations.forEach((filePath) =>
			this._renderContainer!.createAnimation(filePath)
		)
		connectedParticles.forEach(([shortName, filePath], i) => {
			if (!filePath) return

			this._renderContainer!.createParticle(shortName, filePath)
		})

		if (runningAnims)
			runningAnims.forEach((animId) =>
				this._renderContainer?.runningAnimations.add(animId)
			)

		// If requested, load server entity
		if (
			this.previewOptions.loadServerEntity &&
			clientEntity?.description?.identifier
		) {
			const serverEntityFilePath = await packIndexer.find(
				'entity',
				'identifier',
				[clientEntity?.description?.identifier],
				false
			)

			if (serverEntityFilePath.length > 0) {
				this._renderContainer!.addServerEntity(serverEntityFilePath[0])
			}
		}

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
