import { BaseWindow } from '/@/components/Windows/BaseWindow'
import AssetPreviewWindowComponent from './Window.vue'
import type { StandaloneModelViewer } from 'bridge-model-viewer'
import { markRaw, set } from 'vue'
import { Color } from 'three'
import { useBridgeModelViewer } from '/@/utils/libs/useModelViewer'

export interface IAssetPreviewWindowConfig {
	assetName: string
	textureUrl: string
	modelData: any
}

interface IAssetPreviewConfig {
	assetName: string
	previewScale: number
	outputResolution: number
	boneVisibility: Record<string, boolean>
	backgroundColor: string
}

export class AssetPreviewWindow extends BaseWindow<IAssetPreviewConfig | null> {
	protected assetName: string
	protected textureUrl: string
	protected modelData: any
	protected previewScale = 1.5
	protected outputResolution = 4
	protected backgroundColor = '#121212'
	protected modelViewer?: StandaloneModelViewer
	protected bones: Record<string, boolean> = {}

	constructor({
		assetName,
		textureUrl,
		modelData,
	}: IAssetPreviewWindowConfig) {
		super(AssetPreviewWindowComponent, true, false)

		this.assetName = assetName
		this.textureUrl = textureUrl
		this.modelData = markRaw(modelData)

		this.defineWindow()
		this.open()
	}

	async receiveCanvas(canvas: HTMLCanvasElement) {
		const { StandaloneModelViewer } = await useBridgeModelViewer()

		const modelViewer = new StandaloneModelViewer(
			canvas,
			this.modelData,
			this.textureUrl,
			{
				antialias: true,
				height: 500,
				width: 500,
			}
		)

		await modelViewer.loadedModel

		// Initialize bone visibility map
		for (const boneName of modelViewer.getModel().bones) {
			set(this.bones, boneName, true)
		}

		// @ts-ignore
		modelViewer.scene.background = new Color(this.backgroundColor)

		modelViewer.positionCamera(this.previewScale)

		this.modelViewer = modelViewer
		console.log(this)
	}

	startClosing(wasCancelled: boolean) {
		this.close(
			wasCancelled
				? null
				: {
						assetName: this.assetName,
						previewScale: this.previewScale,
						boneVisibility: this.bones,
						backgroundColor: this.backgroundColor,
						outputResolution: this.outputResolution,
				  }
		)
	}
}
