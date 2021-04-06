import { RenderDataContainer } from './RenderContainer'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { IDisposable } from '/@/types/disposable'

export abstract class FileWatcher extends Signal<void> {
	protected fileContent: any
	protected disposable?: IDisposable

	constructor(protected app: App, public readonly filePath: string) {
		super()
		this.activate()

		app.project.getFileFromDiskOrTab(filePath).then(async (file) => {
			await this.onChange(file, true)
			this.dispatch()
		})
	}

	abstract onChange(file: File, isInitial?: boolean): Promise<void> | void

	async activate() {
		if (this.disposable !== undefined) return

		this.disposable = this.app.project.fileChange.on(
			this.filePath,
			(file) => this.onChange(file)
		)
	}
	dispose() {
		this.disposable?.dispose()
		this.disposable = undefined
	}
}
