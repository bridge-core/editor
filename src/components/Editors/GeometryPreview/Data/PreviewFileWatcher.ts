import { App } from '/@/App'
import { FileWatcher } from '/@/components/FileSystem/FileWatcher'

export abstract class PreviewFileWatcher extends FileWatcher {
	constructor(app: App, filePath: string) {
		super(app, filePath)

		// Make sure that the initial setup is complete
		this.ready.on(() => {
			// Then, listen for any further changes
			this.on((file) => this.onChange(file))
		})
	}

	async setup(file: File) {
		return await this.onChange(await this.compileFile(file), true)
	}
	abstract onChange(file: File, isInitial?: boolean): Promise<void> | void
}
