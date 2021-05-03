import { App } from '/@/App'
import { FileWatcher } from '/@/components/FileSystem/FileWatcher'

export abstract class PreviewFileWatcher extends FileWatcher {
	private isInitial = true

	constructor(app: App, filePath: string) {
		super(app, filePath)

		// Make sure that the initial setup is complete
		this.ready.on(() => {
			// Then, listen for any further changes
			this.on((file) => {
				this.onChange(file, this.isInitial)
				if (this.isInitial) this.isInitial = false
			})
		})
	}

	async setup(file: File) {
		return await this.onChange(file, true)
	}
	abstract onChange(file: File, isInitial?: boolean): Promise<void> | void
}
