import { ParticlePreviewTab } from './ParticlePreview'
import { FileWatcher } from '/@/components/FileSystem/FileWatcher'

export class ParticleWatcher extends FileWatcher {
	constructor(protected tab: ParticlePreviewTab) {
		super(tab.tabSystem.app, tab.getProjectPath())
	}

	onChange(file: File) {
		this.tab.onChange(file)
	}
}
