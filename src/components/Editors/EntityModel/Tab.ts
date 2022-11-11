import { App } from '/@/App'
import { RenderDataContainer } from '../GeometryPreview/Data/RenderContainer'
import { GeometryPreviewTab } from '../GeometryPreview/Tab'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import json5 from 'json5'
import { FileWatcher } from '/@/components/FileSystem/FileWatcher'
import { InformationWindow } from '../../Windows/Common/Information/InformationWindow'
import { markRaw } from 'vue'
import { DropdownWindow } from '../../Windows/Common/Dropdown/DropdownWindow'

export interface IPreviewOptions {
	clientEntityFilePath?: string
	loadServerEntity?: boolean
	geometryFilePath?: string
	geometryIdentifier?: string
}

export class EntityModelTab extends GeometryPreviewTab {
	protected previewOptions: IPreviewOptions = {}
	protected clientEntityWatcher?: FileWatcher

	constructor(options: IPreviewOptions, tab: FileTab, parent: TabSystem) {
		super(tab, parent)

		this.previewOptions = options

		if (this.clientEntityFilePath) {
			this.clientEntityWatcher = new FileWatcher(
				App.instance,
				this.clientEntityFilePath
			)

			this.clientEntityWatcher.on((file) => this.reload(file))
		} else {
			this.reload()
		}
	}
	setPreviewOptions(previewOptions: IPreviewOptions) {
		this.previewOptions = Object.assign(this.previewOptions, previewOptions)
	}
	get clientEntityFilePath() {
		return this.previewOptions.clientEntityFilePath
	}
	get geometryFilePath() {
		return this.previewOptions.geometryFilePath
	}
	get geometryIdentifier() {
		return this.previewOptions.geometryIdentifier
	}

	async close() {
		const didClose = await super.close()
		if (didClose) this.clientEntityWatcher?.dispose()

		return didClose
	}

	async reload(file?: File) {
		if (!file) file = await this.clientEntityWatcher?.getFile()

		const runningAnims = this._renderContainer?.runningAnimations

		this._renderContainer?.dispose()
		this._renderContainer = undefined
		this.loadRenderContainer(file, runningAnims)
	}

	async loadRenderContainer(file?: File, runningAnims = new Set<string>()) {
		if (this._renderContainer !== undefined) return
		await this.setupComplete
		const app = await App.getApp()

		const packIndexer = app.project.packIndexer.service
		if (!packIndexer) return

		// No client entity connected, try to load from geometry only
		if (file === undefined) return await this.fallbackToOnlyGeometry()

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

	/**
	 * Store chosen fallback texture to avoid showing the texture picker again upon reload
	 */
	protected chosenFallbackTexturePath?: string
	/**
	 * This function enables bridge. to display models without a client entity.
	 * By default, bridge. will use the geometry file path and identifier as the geometry source and
	 * the user is prompted to choose any entity/block texture file for the model
	 */
	async fallbackToOnlyGeometry() {
		// No geometry file connected, no way to fallback to geometry only
		if (!this.geometryFilePath || !this.geometryIdentifier) return

		const app = await App.getApp()
		const packIndexer = app.project.packIndexer.service

		// Helper method for loading all textures from a specific textures/ subfolder
		const loadTextures = (location: 'entity' | 'blocks') =>
			app.fileSystem
				.readdir(
					app.project.config.resolvePackPath(
						'resourcePack',
						`textures/${location}`
					)
				)
				.then((path) =>
					path.map((path) => ({
						text: `textures/${location}/${path}`,
						value: app.project.config.resolvePackPath(
							'resourcePack',
							`textures/${location}/${path}`
						),
					}))
				)
				.catch(() => <{ text: string; value: string }[]>[])

		if (this.chosenFallbackTexturePath === undefined) {
			// Load all textures from the entity and blocks folders
			const textures = (await loadTextures('entity')).concat(
				await loadTextures('blocks')
			)

			// Prompt user to select a texture
			const choiceWindow = new DropdownWindow({
				options: textures,
				name: 'preview.chooseTexture',
			})

			// Get selected texture
			this.chosenFallbackTexturePath = await choiceWindow.fired
		}

		// Load all available animations (file paths & identifiers)
		const allAnimations = await packIndexer.getAllFiles('clientAnimation')
		const allAnimationIdentifiers = await packIndexer.getCacheDataFor(
			'clientAnimation',
			undefined,
			'identifier'
		)

		// Create fallback render container
		this._renderContainer = markRaw(
			new RenderDataContainer(app, {
				identifier: this.geometryIdentifier,
				texturePaths: [this.chosenFallbackTexturePath],
				connectedAnimations: new Set(allAnimationIdentifiers),
			})
		)

		this._renderContainer.createGeometry(this.geometryFilePath)

		// Create animations so they are ready to be used within the render container
		allAnimations.forEach((filePath) =>
			this._renderContainer!.createAnimation(filePath)
		)

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
