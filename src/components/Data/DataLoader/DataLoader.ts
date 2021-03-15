import { App } from '/@/App'
import { WorkerManager } from '../../Worker/Manager'
import type { DataLoaderService } from './Worker'
import { proxy } from 'comlink'
import DataLoaderWorker from './Worker.ts?worker'
export class DataLoader extends WorkerManager<
	DataLoaderService,
	FileSystemDirectoryHandle,
	App,
	void
> {
	protected async start(app: App) {
		app.windows.loadingWindow.open(
			'windows.loadingWindow.titles.downloadingData'
		)
		await app.fileSystem.fired

		this._service = await new this.workerClass!(
			app.fileSystem.baseDirectory
		)

		this._service?.on(
			proxy(([current, total]) => {
				this.task?.update(current, total)
			}),
			false
		)

		await this._service?.setup()

		app.windows.loadingWindow.close()
		this.deactivate()
	}

	protected createWorker() {
		this.worker = new DataLoaderWorker()
	}
}
