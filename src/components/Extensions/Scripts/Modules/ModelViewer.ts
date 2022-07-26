import { useBridgeModelViewer } from '/@/utils/libs/useModelViewer'

export const ModelViewerModule = async () => {
	const { Model, StandaloneModelViewer } = await useBridgeModelViewer()

	return {
		Model,
		StandaloneModelViewer,
	}
}
