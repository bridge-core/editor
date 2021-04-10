import { App } from '/@/App'
import { FileWatcher } from '/@/components/FileSystem/FileWatcher'

export abstract class PreviewFileWatcher extends FileWatcher {
	private isInitial = true

	constructor(app: App, filePath: string) {
		super(app, filePath)

		this.on((file) => {
			this.onChange(file, this.isInitial)
			if (this.isInitial) this.isInitial = false
		})
	}

	abstract onChange(file: File, isInitial?: boolean): Promise<void> | void
}
