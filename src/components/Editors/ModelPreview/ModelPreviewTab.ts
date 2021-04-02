import { Model } from 'bridge-model-viewer/lib/main'
import json5 from 'json5'
import { App } from '/@/App'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'
import { ThreePreviewTab } from '../ThreePreview/ThreePreviewTab'
import { SimpleAction } from '../../Actions/SimpleAction'
import { transformOldModels } from './transformOldModels'

export class ModelPreviewTab extends ThreePreviewTab<string> {
	protected availableTextures: string[] = []
	onCreate() {
		this.addAction(
			new SimpleAction({
				icon: 'mdi-refresh',
				name: 'Reload',
				onTrigger: () => this.reload(),
			}),
			new SimpleAction({
				icon: 'mdi-cube-outline',
				name: 'Model',
				onTrigger: () => {},
			}),
			new SimpleAction({
				icon: 'mdi-image-outline',
				name: 'Texture',
				onTrigger: () => {},
			})
		)
	}

	async onChange(data: string) {
		await this.setupComplete
		const app = await App.getApp()

		let modelJson: any
		try {
			modelJson = transformOldModels(json5.parse(data))
		} catch {
			// TODO: Invalid JSON error message
			return
		}

		if (modelJson['minecraft:geometry']) {
			modelJson = modelJson['minecraft:geometry'][0]
		}

		const packIndexer = app.project.packIndexer.service
		if (!packIndexer) return

		const connectedClientEntities =
			(await packIndexer.find(
				'clientEntity',
				'geometryIdentifier',
				[modelJson.description.identifier],
				true
			)) ?? []
		const connectedBlocks =
			(await packIndexer.find(
				'block',
				'geometryIdentifier',
				[modelJson.description.identifier],
				true
			)) ?? []

		const connectedTextures = (
			await Promise.all(<Promise<string[]>[]>[
				...connectedClientEntities.map((clientEntity) =>
					packIndexer.getCacheDataFor(
						'clientEntity',
						clientEntity,
						'texturePath'
					)
				),
				...connectedBlocks.map((block) =>
					packIndexer.getCacheDataFor('block', block, 'texturePath')
				),
			])
		).flat()
		this.availableTextures = connectedTextures

		// No connected client entity file -> nothing to display
		if (connectedClientEntities.length === 0) return

		if (this.model) this.scene?.remove(this.model.getModel())
		this.model = new Model(
			modelJson,
			await loadAsDataURL(
				`RP/${connectedTextures[0]}`,
				app.project.fileSystem
			)
		)
		this.scene.add(this.model.getModel())

		setTimeout(() => {
			this.requestRendering()
		}, 100)
	}

	get icon() {
		return 'mdi-cube-outline'
	}
	get iconColor() {
		return 'primary'
	}
}
