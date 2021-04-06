import { ParticlePreviewTab } from './ParticlePreview'
import { App } from '/@/App'
import { FileWatcher } from '/@/components/Editors/GeometryPreview/Data/FileWatcher'

export class ParticleWatcher extends FileWatcher {
	constructor(protected tab: ParticlePreviewTab) {
		super(tab.tabSystem.app, tab.getProjectPath())
	}

	onChange(file: File) {
		this.tab.onChange(file)
	}
}
