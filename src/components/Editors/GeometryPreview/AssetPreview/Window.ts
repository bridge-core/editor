import AssetPreviewWindowComponent from './Window.vue'
import type { StandaloneModelViewer } from 'bridge-model-viewer'
import { markRaw, reactive } from 'vue'
import { Color } from 'three'
import { useBridgeModelViewer } from '/@/utils/libs/useModelViewer'
import { NewBaseWindow } from '/@/components/Windows/NewBaseWindow'

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

export class AssetPreviewWindow extends NewBaseWindow<IAssetPreviewConfig | null> {
	protected textureUrl: string
	protected modelData: any
	protected modelViewer?: StandaloneModelViewer
	protected state = reactive<any>({
		...super.state,
		bones: {},
		assetName: '',
		backgroundColor: '#121212',
		previewScale: 1.5,
		outputResolution: 4,
	})

	constructor({
		assetName,
		textureUrl,
		modelData,
	}: IAssetPreviewWindowConfig) {
		super(AssetPreviewWindowComponent, true, false)

		this.state.assetName = assetName
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
		this.state.bones = Object.fromEntries(
			modelViewer.getModel().bones.map((boneName) => [boneName, true])
		)

		// @ts-ignore
		modelViewer.scene.background = new Color(this.state.backgroundColor)

		modelViewer.positionCamera(this.state.previewScale)

		this.modelViewer = markRaw(modelViewer)
	}

	startClosing(wasCancelled: boolean) {
		this.close(
			wasCancelled
				? null
				: {
						assetName: this.state.assetName,
						previewScale: this.state.previewScale,
						boneVisibility: this.state.bones,
						backgroundColor: this.state.backgroundColor,
						outputResolution: this.state.outputResolution,
				  }
		)
	}
}
