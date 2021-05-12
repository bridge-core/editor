import { PreviewFileWatcher } from '/@/components/Editors/GeometryPreview/Data/PreviewFileWatcher'
import { ParticlePreviewTab } from './ParticlePreview'

export class ParticleWatcher extends PreviewFileWatcher {
	constructor(protected tab: ParticlePreviewTab, filePath: string) {
		super(tab.tabSystem.app, filePath)
	}

	onChange(file: File) {
		this.tab.onChange(file)
	}
}
