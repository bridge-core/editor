import { RenderDataContainer } from './RenderContainer'
import { Signal } from '/@/components/Common/Event/Signal'
import { IDisposable } from '/@/types/disposable'

export abstract class FileWatcher extends Signal<void> {
	protected fileContent: any
	protected disposable?: IDisposable

	constructor(
		protected parent: RenderDataContainer,
		public readonly filePath: string
	) {
		super()
		this.activate()

		parent.app.project.getFileFromDiskOrTab(filePath).then(async (file) => {
			await this.onChange(file, true)
			this.dispatch()
		})
	}

	abstract onChange(file: File, isInitial?: boolean): Promise<void> | void

	activate() {
		if (!this.disposable)
			this.disposable = this.parent.app.project.fileChange.on(
				this.filePath,
				(file) => this.onChange(file)
			)
	}
	dispose() {
		this.disposable?.dispose()
		this.disposable = undefined
	}
}
