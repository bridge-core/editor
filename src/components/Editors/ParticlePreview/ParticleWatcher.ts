import { PreviewFileWatcher } from '/@/components/Editors/GeometryPreview/Data/PreviewFileWatcher'
import { ParticlePreviewTab } from './ParticlePreview'

export class ParticleWatcher extends PreviewFileWatcher {
	constructor(protected tab: ParticlePreviewTab) {
		super(tab.tabSystem.app, tab.getProjectPath())
	}

	onChange(file: File) {
		this.tab.onChange(file)
	}
}
