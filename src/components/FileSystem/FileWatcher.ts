import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'
import { IDisposable } from '/@/types/disposable'

export class FileWatcher extends EventDispatcher<File> {
	protected fileContent: any
	protected disposable?: IDisposable
	protected children: ChildFileWatcher[] = []
	public readonly ready = new Signal<void>()

	constructor(protected app: App, public readonly filePath: string) {
		super()
		this.activate()

		app.project.getFileFromDiskOrTab(filePath).then(async (file) => {
			await this.onFileChange(file)
			await this.setup(file)
			this.ready.dispatch()
		})
	}

	async setup(file: File) {}

	async activate() {
		if (this.disposable !== undefined) return

		this.disposable = this.app.project.fileChange.on(
			this.filePath,
			(file) => this.onFileChange(file)
		)
	}
	async requestFile(file: File) {
		await this.onFileChange(file)

		return new Promise<File>((resolve) => {
			this.once((file) => resolve(file))
		})
	}

	async compileFile(file: File) {
		const [
			dependencies,
			compiled,
		] = await this.app.project.compilerService.compileFile(
			this.filePath,
			new Uint8Array(await file.arrayBuffer())
		)

		this.children.forEach((child) => child.dispose())
		this.children = []

		dependencies.forEach((dep) => {
			const watcher = new ChildFileWatcher(this.app, dep)
			this.children.push(watcher)
			watcher.on(() => this.onFileChange(file))
		})

		return new File([compiled], file.name)
	}

	protected async onFileChange(file: File) {
		this.dispatch(await this.compileFile(file))
	}
	async getFile() {
		return this.compileFile(
			await this.app.project.getFileFromDiskOrTab(this.filePath)
		)
	}
	dispose() {
		this.disposable?.dispose()
		this.disposable = undefined
		this.children.forEach((child) => child.dispose())
	}
}

export class ChildFileWatcher extends EventDispatcher<void> {
	protected disposable?: IDisposable

	constructor(protected app: App, public readonly filePath: string) {
		super()
		this.activate()
	}

	async activate() {
		if (this.disposable !== undefined) return

		this.disposable = this.app.project.fileSave.on(this.filePath, (file) =>
			this.onFileChange(file)
		)
	}

	protected async onFileChange(data: File) {
		this.dispatch()
	}
	dispose() {
		this.disposable?.dispose()
		this.disposable = undefined
	}
}
